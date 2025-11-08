export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  location?: string;
  company?: string;
  blog?: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count?: number;
  language: string;
  updated_at: string;
  html_url: string;
  commits_count?: number; // Number of commits in the year
  prs_count?: number; // Number of PRs (estimated)
  is_pinned?: boolean; // Whether repo is pinned
}

export interface GitHubStats {
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  totalStars: number;
  topRepos: GitHubRepo[];
  languages: Record<string, number>;
  commitTimeline: { month: string; commits: number }[];
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser & { email?: string }> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  const user = await response.json();
  
  // Try to get user's emails for better commit matching
  try {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      const primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
      if (primaryEmail) {
        user.email = primaryEmail;
      }
    }
  } catch (error) {
    console.error("Failed to fetch user emails:", error);
  }

  return user;
}

export async function fetchUserRepos(
  accessToken: string,
  username: string
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  const seenRepos = new Set<string>(); // Track repos to avoid duplicates
  let page = 1;
  const perPage = 100;

  // Fetch all repos with all affiliations (owner, collaborator, organization_member)
  // This includes repos from organizations the user is a member of
  while (true) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const data = await response.json();
    if (data.length === 0) break;

    // Map to include all necessary fields and filter duplicates
    const mappedRepos = data
      .map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        updated_at: repo.updated_at,
        html_url: repo.html_url,
      }))
      .filter((repo: GitHubRepo) => {
        // Avoid duplicate repos
        if (seenRepos.has(repo.full_name)) {
          return false;
        }
        seenRepos.add(repo.full_name);
        return true;
      });

    repos.push(...mappedRepos);
    page++;

    if (data.length < perPage) break;
  }

  // Also fetch repos from organizations the user is a member of
  try {
    const orgsResponse = await fetch("https://api.github.com/user/orgs", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (orgsResponse.ok) {
      const orgs = await orgsResponse.json();
      console.log(`Found ${orgs.length} organizations`);

      // Fetch repos from each organization
      for (const org of orgs) {
        let orgPage = 1;
        while (true) {
          try {
            const orgReposResponse = await fetch(
              `https://api.github.com/orgs/${org.login}/repos?per_page=${perPage}&page=${orgPage}&type=all`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  Accept: "application/vnd.github.v3+json",
                },
              }
            );

            if (!orgReposResponse.ok) {
              break;
            }

            const orgRepos = await orgReposResponse.json();
            if (orgRepos.length === 0) break;

            // Add organization repos that aren't already in the list
            const newOrgRepos = orgRepos
              .map((repo: any) => ({
                id: repo.id,
                name: repo.name,
                full_name: repo.full_name,
                description: repo.description,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
                language: repo.language,
                updated_at: repo.updated_at,
                html_url: repo.html_url,
              }))
              .filter((repo: GitHubRepo) => {
                if (seenRepos.has(repo.full_name)) {
                  return false;
                }
                seenRepos.add(repo.full_name);
                return true;
              });

            repos.push(...newOrgRepos);
            orgPage++;

            if (orgRepos.length < perPage) break;
          } catch (error) {
            console.error(`Error fetching repos for org ${org.login}:`, error);
            break;
          }
        }
      }
    }
  } catch (error) {
    console.log("Could not fetch organization repos (this is optional):", error);
  }

  console.log(`Total repositories found (including orgs): ${repos.length}`);
  return repos;
}

async function fetchAllCommitsFromRepo(
  accessToken: string,
  repoFullName: string,
  username: string,
  startDate: string,
  endDate: string
): Promise<number> {
  let totalCommits = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      // Try with author filter first
      let response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&author=${username}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      // If author filter doesn't work or returns 404, try without author filter
      // (some commits might have different email addresses)
      if (!response.ok && response.status === 404) {
        response = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&per_page=${perPage}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
      }

      if (!response.ok) {
        // If rate limited or other error, break and return what we have
        if (response.status === 403 || response.status === 404) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      // Filter commits by author username (in case we didn't use author filter)
      // Check both author.login and committer.login
      const userCommits = commits.filter((commit: any) => {
        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const userLower = username.toLowerCase();
        return authorLogin === userLower || committerLogin === userLower;
      });

      totalCommits += userCommits.length;

      // Check if there are more pages using Link header
      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      // If we got fewer commits than expected, we might have reached the end
      if (!hasNextPage || commits.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching commits for ${repoFullName} page ${page}:`, error);
      break;
    }
  }

  return totalCommits;
}

// Fetch commits with dates for timeline generation
async function fetchCommitsWithDatesFromRepo(
  accessToken: string,
  repoFullName: string,
  username: string,
  startDate: string,
  endDate: string
): Promise<Date[]> {
  const commitDates: Date[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      let response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&author=${username}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok && response.status === 404) {
        response = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&per_page=${perPage}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
      }

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      const userCommits = commits.filter((commit: any) => {
        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const userLower = username.toLowerCase();
        return authorLogin === userLower || committerLogin === userLower;
      });

      // Extract commit dates
      userCommits.forEach((commit: any) => {
        if (commit.commit?.author?.date) {
          commitDates.push(new Date(commit.commit.author.date));
        }
      });

      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      if (!hasNextPage || commits.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching commits for ${repoFullName} page ${page}:`, error);
      break;
    }
  }

  return commitDates;
}

export async function fetchYearlyCommits(
  accessToken: string,
  username: string,
  year: number = 2025
): Promise<number> {
  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year}-12-31T23:59:59Z`;

  // Get all repos (no limit, but we'll process them in batches)
  const repos = await fetchUserRepos(accessToken, username);
  
  console.log(`Found ${repos.length} repositories to check for commits`);
  
  let totalCommits = 0;
  let processedRepos = 0;

  // Process all repos, but limit concurrent requests to avoid rate limits
  const batchSize = 10;
  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    
    // Process batch in parallel
    const batchPromises = batch.map(async (repo) => {
      try {
        const commits = await fetchAllCommitsFromRepo(
          accessToken,
          repo.full_name,
          username,
          startDate,
          endDate
        );
        processedRepos++;
        if (commits > 0) {
          console.log(`Repo ${repo.full_name}: ${commits} commits`);
        }
        return commits;
      } catch (error) {
        console.error(`Error processing repo ${repo.full_name}:`, error);
        return 0;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    totalCommits += batchResults.reduce((sum, commits) => sum + commits, 0);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < repos.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Total commits for ${year}: ${totalCommits} across ${processedRepos} repositories`);
  return totalCommits;
}

// Alternative method: Use GitHub Events API for more accurate contribution count
export async function fetchContributionsViaEvents(
  accessToken: string,
  username: string,
  year: number = 2025
): Promise<number> {
  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year}-12-31T23:59:59Z`;
  let totalContributions = 0;
  let page = 1;
  const perPage = 100;

  // GitHub Events API provides user events
  while (true) {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/events/public?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          break;
        }
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const events = await response.json();
      
      if (events.length === 0) {
        break;
      }

      // Filter events by date and count contributions
      const yearEvents = events.filter((event: any) => {
        const eventDate = new Date(event.created_at);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return eventDate >= start && eventDate <= end;
      });

      // Count PushEvents (commits)
      const pushEvents = yearEvents.filter((event: any) => event.type === 'PushEvent');
      pushEvents.forEach((event: any) => {
        if (event.payload && event.payload.commits) {
          totalContributions += event.payload.commits.length;
        }
      });

      // Check if there are more pages
      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      if (!hasNextPage || events.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching events page ${page}:`, error);
      break;
    }
  }

  return totalContributions;
}

export async function fetchPublicUser(username: string): Promise<GitHubUser> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("User not found");
    }
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}

export async function fetchPublicRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=${perPage}&page=${page}&sort=updated&type=owner`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const data = await response.json();
    if (data.length === 0) break;

    // Map to include all necessary fields
    const mappedRepos = data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at,
      html_url: repo.html_url,
    }));

    repos.push(...mappedRepos);
    page++;

    if (data.length < perPage) break;
  }

  return repos;
}

async function fetchAllPublicCommitsFromRepo(
  repoFullName: string,
  username: string,
  startDate: string,
  endDate: string
): Promise<number> {
  let totalCommits = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      // Try with author filter first
      let response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&author=${username}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      // If author filter doesn't work, try without author filter
      if (!response.ok && response.status === 404) {
        response = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&per_page=${perPage}&page=${page}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
      }

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      // Filter commits by author username (in case we didn't use author filter)
      const userCommits = commits.filter((commit: any) => {
        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const userLower = username.toLowerCase();
        return authorLogin === userLower || committerLogin === userLower;
      });

      totalCommits += userCommits.length;

      // Check if there are more pages using Link header
      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      if (!hasNextPage || commits.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching commits for ${repoFullName} page ${page}:`, error);
      break;
    }
  }

  return totalCommits;
}

// Fetch public commits with dates for timeline generation
async function fetchPublicCommitsWithDatesFromRepo(
  repoFullName: string,
  username: string,
  startDate: string,
  endDate: string
): Promise<Date[]> {
  const commitDates: Date[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      let response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&author=${username}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok && response.status === 404) {
        response = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&per_page=${perPage}&page=${page}`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
      }

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      const userCommits = commits.filter((commit: any) => {
        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const userLower = username.toLowerCase();
        return authorLogin === userLower || committerLogin === userLower;
      });

      userCommits.forEach((commit: any) => {
        if (commit.commit?.author?.date) {
          commitDates.push(new Date(commit.commit.author.date));
        }
      });

      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      if (!hasNextPage || commits.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching commits for ${repoFullName} page ${page}:`, error);
      break;
    }
  }

  return commitDates;
}

export async function fetchPublicYearlyCommits(
  username: string,
  year: number = 2025
): Promise<number> {
  const startDate = `${year}-01-01T00:00:00Z`;
  const endDate = `${year}-12-31T23:59:59Z`;

  // Get all public repos
  const repos = await fetchPublicRepos(username);
  
  console.log(`Found ${repos.length} public repositories to check for commits`);
  
  let totalCommits = 0;
  let processedRepos = 0;

  // Process all repos in batches to avoid rate limits
  const batchSize = 5; // Smaller batch for unauthenticated requests
  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    
    // Process batch sequentially for public API (rate limit is stricter)
    for (const repo of batch) {
      try {
        const commits = await fetchAllPublicCommitsFromRepo(
          repo.full_name,
          username,
          startDate,
          endDate
        );
        processedRepos++;
        if (commits > 0) {
          console.log(`Repo ${repo.full_name}: ${commits} commits`);
        }
        totalCommits += commits;
        
        // Delay between requests for unauthenticated API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error processing repo ${repo.full_name}:`, error);
      }
    }
  }

  console.log(`Total public commits for ${year}: ${totalCommits} across ${processedRepos} repositories`);
  return totalCommits;
}

export async function fetchGitHubStats(
  accessToken: string,
  username: string,
  year?: number
): Promise<GitHubStats> {
  const repos = await fetchUserRepos(accessToken, username);
  
  // Calculate last 365 days from TODAY (request time)
  // endDate = today (current date/time when request is made)
  // startDate = 365 days before today
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of today
  
  // Calculate startDate as 365 days before endDate (more accurate than setDate)
  const startDate = new Date(endDate);
  startDate.setTime(startDate.getTime() - (365 * 24 * 60 * 60 * 1000));
  startDate.setHours(0, 0, 0, 0); // Start of that day
  
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  console.log(`Date range: ${startDateStr} to ${endDateStr} (365 days)`);
  
  console.log(`Processing ${repos.length} repositories for commit counts...`);
  
  // Calculate stats
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  
  // Fetch commit counts for each repo and add to repo object
  const reposWithCommits: GitHubRepo[] = [];
  let totalCommits = 0;
  
  // Process repos in batches to get commit counts
  // Process ALL repos, not just first 50
  const batchSize = 10;
  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        const commits = await fetchAllCommitsFromRepo(
          accessToken,
          repo.full_name,
          username,
          startDateStr,
          endDateStr
        );
        totalCommits += commits;
        if (commits > 0) {
          console.log(`✓ ${repo.full_name}: ${commits} commits`);
        }
        return {
          ...repo,
          commits_count: commits,
          prs_count: Math.floor(commits * 0.3), // Estimate PRs based on commits
        };
      } catch (error) {
        console.error(`✗ Error fetching commits for ${repo.full_name}:`, error);
        return {
          ...repo,
          commits_count: 0,
          prs_count: 0, // Ensure prs_count is set even on error
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    reposWithCommits.push(...batchResults);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < repos.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  // Fetch pinned repositories using GraphQL API
  let pinnedRepos: string[] = [];
  try {
    const graphqlResponse = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            user(login: "${username}") {
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    nameWithOwner
                  }
                }
              }
            }
          }
        `,
      }),
    });

    if (graphqlResponse.ok) {
      const graphqlData = await graphqlResponse.json();
      if (graphqlData.data?.user?.pinnedItems?.nodes) {
        pinnedRepos = graphqlData.data.user.pinnedItems.nodes.map(
          (node: any) => node.nameWithOwner
        );
      }
    }
  } catch (error) {
    console.log("Could not fetch pinned repos (this is optional):", error);
  }

  // Mark pinned repos and include all repos for different sorting options
  // Frontend will handle sorting based on user selection
  const topRepos = reposWithCommits.map((repo) => ({
    ...repo,
    is_pinned: pinnedRepos.includes(repo.full_name),
  }));

  // Count languages
  const languages: Record<string, number> = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Fetch commit dates for timeline (sample from top repos to avoid too many API calls)
  const allCommitDates: Date[] = [];
  const topReposForTimeline = reposWithCommits
    .filter(r => (r.commits_count || 0) > 0)
    .sort((a, b) => (b.commits_count || 0) - (a.commits_count || 0))
    .slice(0, Math.min(20, reposWithCommits.length)); // Sample top 20 repos

  console.log(`Fetching commit dates from ${topReposForTimeline.length} repos for timeline...`);
  
  for (const repo of topReposForTimeline) {
    try {
      const dates = await fetchCommitsWithDatesFromRepo(
        accessToken,
        repo.full_name,
        username,
        startDateStr,
        endDateStr
      );
      allCommitDates.push(...dates);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Error fetching commit dates for ${repo.full_name}:`, error);
    }
  }

  // Group commits by month
  const monthCounts: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  allCommitDates.forEach((date) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  // Generate timeline for last 365 days (only months that have passed or current month)
  const today = new Date();
  const commitTimeline: { month: string; commits: number }[] = [];
  
  // Start from 12 months ago and go to current month
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    // Only include months that are in the past or current month (not future months)
    // Check if the month is before or equal to current month in the same year, or in a previous year
    const isPastOrCurrentMonth = 
      (date.getFullYear() < today.getFullYear()) ||
      (date.getFullYear() === today.getFullYear() && date.getMonth() <= today.getMonth());
    
    if (isPastOrCurrentMonth) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()];
      commitTimeline.push({
        month: monthName,
        commits: monthCounts[monthKey] || 0,
      });
    }
  }

  // Scale up the timeline to match total commits (if we sampled repos)
  if (topReposForTimeline.length < reposWithCommits.length && totalCommits > 0) {
    const sampledCommits = allCommitDates.length;
    if (sampledCommits > 0) {
      const scaleFactor = totalCommits / sampledCommits;
      commitTimeline.forEach((item) => {
        item.commits = Math.round(item.commits * scaleFactor);
      });
    }
  }

  // Estimate PRs and Issues (GitHub API doesn't provide easy yearly stats)
  const totalPRs = Math.floor(totalCommits * 0.3);
  const totalIssues = Math.floor(totalCommits * 0.2);

  console.log(`\n📊 Summary:`);
  console.log(`   Total repositories: ${repos.length}`);
  console.log(`   Repositories with commits: ${reposWithCommits.filter(r => (r.commits_count || 0) > 0).length}`);
  console.log(`   Total commits calculated: ${totalCommits}`);

  return {
    totalCommits,
    totalPRs,
    totalIssues,
    totalStars,
    topRepos,
    languages,
    commitTimeline,
  };
}

export async function fetchPublicGitHubStats(
  username: string,
  year?: number
): Promise<GitHubStats> {
  const repos = await fetchPublicRepos(username);
  
  // Calculate last 365 days from TODAY (request time)
  // endDate = today (current date/time when request is made)
  // startDate = 365 days before today
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999); // End of today
  
  // Calculate startDate as 365 days before endDate (more accurate than setDate)
  const startDate = new Date(endDate);
  startDate.setTime(startDate.getTime() - (365 * 24 * 60 * 60 * 1000));
  startDate.setHours(0, 0, 0, 0); // Start of that day
  
  const startDateStr = startDate.toISOString();
  const endDateStr = endDate.toISOString();
  
  console.log(`Date range: ${startDateStr} to ${endDateStr} (365 days)`);
  
  console.log(`Processing ${repos.length} public repositories for commit counts...`);
  
  // Calculate stats (public repos only)
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  
  // Fetch commit counts for each repo and add to repo object
  const reposWithCommits: GitHubRepo[] = [];
  let totalCommits = 0;
  
  // Process repos in batches to get commit counts
  const batchSize = 5; // Smaller batch for unauthenticated requests
  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    
    // Process batch sequentially for public API
    for (const repo of batch) {
      try {
        const commits = await fetchAllPublicCommitsFromRepo(
          repo.full_name,
          username,
          startDateStr,
          endDateStr
        );
        totalCommits += commits;
        reposWithCommits.push({
          ...repo,
          commits_count: commits,
          prs_count: Math.floor(commits * 0.25), // Estimate PRs for public repos
        });
        
        // Delay between requests for unauthenticated API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching commits for ${repo.full_name}:`, error);
        reposWithCommits.push({
          ...repo,
          commits_count: 0,
          prs_count: 0, // Ensure prs_count is set even on error
        });
      }
    }
  }
  
  // Include all repos for different sorting options
  // Frontend will handle sorting based on user selection
  // Public API doesn't support pinned repos, so set is_pinned to false
  const topRepos = reposWithCommits.map((repo) => ({
    ...repo,
    is_pinned: false,
  }));

  // Count languages
  const languages: Record<string, number> = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Fetch commit dates for timeline (sample from top repos to avoid too many API calls)
  const allCommitDates: Date[] = [];
  const topReposForTimeline = reposWithCommits
    .filter(r => (r.commits_count || 0) > 0)
    .sort((a, b) => (b.commits_count || 0) - (a.commits_count || 0))
    .slice(0, Math.min(10, reposWithCommits.length)); // Sample top 10 repos for public API

  console.log(`Fetching commit dates from ${topReposForTimeline.length} repos for timeline...`);
  
  for (const repo of topReposForTimeline) {
    try {
      const dates = await fetchPublicCommitsWithDatesFromRepo(
        repo.full_name,
        username,
        startDateStr,
        endDateStr
      );
      allCommitDates.push(...dates);
      
      // Delay between requests for unauthenticated API
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error fetching commit dates for ${repo.full_name}:`, error);
    }
  }

  // Group commits by month
  const monthCounts: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  allCommitDates.forEach((date) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  // Generate timeline for last 365 days (only months that have passed or current month)
  const today = new Date();
  const commitTimeline: { month: string; commits: number }[] = [];
  
  // Start from 12 months ago and go to current month
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    // Only include months that are in the past or current month (not future months)
    // Check if the month is before or equal to current month in the same year, or in a previous year
    const isPastOrCurrentMonth = 
      (date.getFullYear() < today.getFullYear()) ||
      (date.getFullYear() === today.getFullYear() && date.getMonth() <= today.getMonth());
    
    if (isPastOrCurrentMonth) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = monthNames[date.getMonth()];
      commitTimeline.push({
        month: monthName,
        commits: monthCounts[monthKey] || 0,
      });
    }
  }

  // Scale up the timeline to match total commits (if we sampled repos)
  if (topReposForTimeline.length < reposWithCommits.length && totalCommits > 0) {
    const sampledCommits = allCommitDates.length;
    if (sampledCommits > 0) {
      const scaleFactor = totalCommits / sampledCommits;
      commitTimeline.forEach((item) => {
        item.commits = Math.round(item.commits * scaleFactor);
      });
    }
  }

  // Estimate PRs and Issues (GitHub API doesn't provide easy yearly stats for public data)
  const totalPRs = Math.floor(totalCommits * 0.25); // Lower estimate for public data
  const totalIssues = Math.floor(totalCommits * 0.15);

  console.log(`Total public commits calculated: ${totalCommits}`);

  return {
    totalCommits,
    totalPRs,
    totalIssues,
    totalStars,
    topRepos,
    languages,
    commitTimeline,
  };
}

