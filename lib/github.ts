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
  default_branch?: string; // Default branch (usually 'main' or 'master')
  commits_count?: number; // Number of commits in the year
  prs_count?: number; // Number of PRs (estimated)
  is_pinned?: boolean; // Whether repo is pinned
  fork?: boolean; // Whether repo is a fork
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

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser & { email?: string; emails?: string[] }> {
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
  
  // Get all user's emails for better commit matching
  // GitHub counts commits based on email addresses associated with the account
  try {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    
    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      // Get all verified emails (GitHub uses all verified emails for contribution counting)
      const verifiedEmails = emails
        .filter((email: any) => email.verified)
        .map((email: any) => email.email.toLowerCase());
      
      user.emails = verifiedEmails;
      const primaryEmail = emails.find((email: any) => email.primary)?.email || emails[0]?.email;
      if (primaryEmail) {
        user.email = primaryEmail;
      }
      
      console.log(`Found ${verifiedEmails.length} verified email addresses for user`);
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
        default_branch: repo.default_branch, // Store default branch for accurate commit counting
        fork: repo.fork || false, // Store fork status (GitHub doesn't count commits in forks)
      }))
      .filter((repo: GitHubRepo & { default_branch?: string }) => {
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
                default_branch: repo.default_branch, // Store default branch
                fork: repo.fork || false, // Store fork status
              }))
              .filter((repo: GitHubRepo & { default_branch?: string }) => {
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

// Fetch all branches from a repository
async function fetchAllBranches(
  accessToken: string,
  repoFullName: string
): Promise<string[]> {
  const branches: string[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/branches?per_page=${perPage}&page=${page}`,
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
        // If we can't fetch branches, return empty array (will fall back to default branch)
        console.warn(`Could not fetch branches for ${repoFullName}: ${response.status}`);
        break;
      }

      const data = await response.json();
      if (data.length === 0) break;

      branches.push(...data.map((branch: any) => branch.name));

      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      if (!hasNextPage || data.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching branches for ${repoFullName}:`, error);
      break;
    }
  }

  return branches;
}

async function fetchAllCommitsFromRepo(
  accessToken: string,
  repoFullName: string,
  username: string,
  startDate: string,
  endDate: string,
  userEmails: string[] = [],
  isFork: boolean = false
): Promise<number> {
  // GitHub doesn't count commits in forks (unless they're in a PR to the parent repo)
  // For now, we'll skip fork commits entirely to match GitHub's behavior more closely
  // Note: In the future, we could check if commits are in PRs, but that's complex
  if (isFork) {
    return 0;
  }

  const usernameLower = username.toLowerCase();
  const userEmailsLower = userEmails.map(e => e.toLowerCase());
  
  // Track unique commits by SHA to avoid counting the same commit multiple times
  // (a commit can exist in multiple branches)
  const seenCommitSHAs = new Set<string>();
  let totalCommits = 0;

  // Fetch all branches for this repository
  const branches = await fetchAllBranches(accessToken, repoFullName);
  
  // If we couldn't fetch branches, fall back to fetching all commits (no branch filter)
  // This happens when the API doesn't allow branch listing
  if (branches.length === 0) {
    console.log(`No branches found for ${repoFullName}, fetching all commits`);
    // Fetch commits from all branches (no sha parameter)
    totalCommits = await fetchCommitsFromBranch(
      accessToken,
      repoFullName,
      usernameLower,
      userEmailsLower,
      startDate,
      endDate,
      seenCommitSHAs,
      undefined // undefined = all branches
    );
  } else {
    // Fetch commits from each branch
    console.log(`Fetching commits from ${branches.length} branches for ${repoFullName}`);
    for (const branch of branches) {
      const branchCommits = await fetchCommitsFromBranch(
        accessToken,
        repoFullName,
        usernameLower,
        userEmailsLower,
        startDate,
        endDate,
        seenCommitSHAs,
        branch
      );
      totalCommits += branchCommits;
    }
  }

  return totalCommits;
}

// Helper function to fetch commits from a specific branch (or all branches if branch is undefined)
async function fetchCommitsFromBranch(
  accessToken: string,
  repoFullName: string,
  usernameLower: string,
  userEmailsLower: string[],
  startDate: string,
  endDate: string,
  seenCommitSHAs: Set<string>,
  branch?: string
): Promise<number> {
  let branchCommits = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      // If branch is specified, fetch commits from that branch
      // Otherwise, fetch from all branches (default behavior when sha is not provided)
      const shaParam = branch ? `&sha=${branch}` : "";
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}${shaParam}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403 || response.status === 404 || response.status === 409) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      // Filter commits using GitHub's contribution counting logic:
      // 1. Check author.login or committer.login matches username
      // 2. Check author.email or committer.email matches user's verified emails
      // 3. Check for co-authored commits (Co-authored-by in commit message)
      // 4. Exclude merge commits that don't match user (GitHub excludes most merge commits)
      // 5. Exclude duplicate commits (same SHA across branches)
      const userCommits = commits.filter((commit: any) => {
        const commitSHA = commit.sha;
        
        // Skip if we've already counted this commit (from another branch)
        if (seenCommitSHAs.has(commitSHA)) {
          return false;
        }

        // Check author/committer username
        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const isAuthorMatch = authorLogin === usernameLower;
        const isCommitterMatch = committerLogin === usernameLower;

        // Check author/committer email
        const authorEmail = commit.commit?.author?.email?.toLowerCase();
        const committerEmail = commit.commit?.committer?.email?.toLowerCase();
        const isAuthorEmailMatch = authorEmail && userEmailsLower.includes(authorEmail);
        const isCommitterEmailMatch = committerEmail && userEmailsLower.includes(committerEmail);

        // Check for co-authored commits in commit message
        const commitMessage = commit.commit?.message || "";
        const coAuthoredPattern = /co-authored-by:\s*(.+?)\s*<(.+?)>/gi;
        const coAuthors: string[] = [];
        let match;
        while ((match = coAuthoredPattern.exec(commitMessage)) !== null) {
          const coAuthorEmail = match[2]?.toLowerCase();
          if (coAuthorEmail) {
            coAuthors.push(coAuthorEmail);
          }
        }
        const isCoAuthorMatch = coAuthors.some(email => userEmailsLower.includes(email));

        // Check if it's a merge commit
        const isMergeCommit = commit.commit?.message?.startsWith("Merge") || 
                             commit.commit?.parents?.length > 1;

        // GitHub counts commits if:
        // 1. User is author OR committer (by login or email)
        // 2. User is co-author (by email)
        // 3. For merge commits, only count if user created the merge (not just merged by someone else)
        const isUserCommit = isAuthorMatch || isCommitterMatch || 
                           isAuthorEmailMatch || isCommitterEmailMatch || 
                           isCoAuthorMatch;

        // For merge commits, only count if user is the author (not just committer)
        if (isMergeCommit && !isAuthorMatch && !isAuthorEmailMatch) {
          return false;
        }

        if (isUserCommit) {
          // Mark this commit as seen so we don't count it again from other branches
          seenCommitSHAs.add(commitSHA);
          return true;
        }

        return false;
      });

      branchCommits += userCommits.length;

      // Check if there are more pages using Link header
      const linkHeader = response.headers.get("link");
      const hasNextPage = linkHeader?.includes('rel="next"');

      // If we got fewer commits than expected, we might have reached the end
      if (!hasNextPage || commits.length < perPage) {
        break;
      }

      page++;
    } catch (error) {
      console.error(`Error fetching commits for ${repoFullName}${branch ? ` (branch: ${branch})` : ""} page ${page}:`, error);
      break;
    }
  }

  return branchCommits;
}

// Fetch commits with dates for timeline generation
async function fetchCommitsWithDatesFromRepo(
  accessToken: string,
  repoFullName: string,
  username: string,
  startDate: string,
  endDate: string,
  userEmails: string[] = [],
  isFork: boolean = false
): Promise<Date[]> {
  // GitHub doesn't count commits in forks
  if (isFork) {
    return [];
  }

  const commitDates: Date[] = [];
  const usernameLower = username.toLowerCase();
  const userEmailsLower = userEmails.map(e => e.toLowerCase());
  
  // Track unique commits by SHA to avoid counting the same commit multiple times
  const seenCommitSHAs = new Set<string>();

  // Fetch all branches for this repository
  const branches = await fetchAllBranches(accessToken, repoFullName);
  
  // If we couldn't fetch branches, fall back to fetching all commits
  if (branches.length === 0) {
    const dates = await fetchCommitDatesFromBranch(
      accessToken,
      repoFullName,
      usernameLower,
      userEmailsLower,
      startDate,
      endDate,
      seenCommitSHAs,
      undefined
    );
    commitDates.push(...dates);
  } else {
    // Fetch commits from each branch
    for (const branch of branches) {
      const dates = await fetchCommitDatesFromBranch(
        accessToken,
        repoFullName,
        usernameLower,
        userEmailsLower,
        startDate,
        endDate,
        seenCommitSHAs,
        branch
      );
      commitDates.push(...dates);
    }
  }

  return commitDates;
}

// Helper function to fetch commit dates from a specific branch
async function fetchCommitDatesFromBranch(
  accessToken: string,
  repoFullName: string,
  usernameLower: string,
  userEmailsLower: string[],
  startDate: string,
  endDate: string,
  seenCommitSHAs: Set<string>,
  branch?: string
): Promise<Date[]> {
  const commitDates: Date[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      const shaParam = branch ? `&sha=${branch}` : "";
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}${shaParam}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 403 || response.status === 404 || response.status === 409) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      // Filter commits using the same logic as fetchAllCommitsFromRepo
      const userCommits = commits.filter((commit: any) => {
        const commitSHA = commit.sha;
        
        // Skip if we've already counted this commit
        if (seenCommitSHAs.has(commitSHA)) {
          return false;
        }

        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const isAuthorMatch = authorLogin === usernameLower;
        const isCommitterMatch = committerLogin === usernameLower;

        const authorEmail = commit.commit?.author?.email?.toLowerCase();
        const committerEmail = commit.commit?.committer?.email?.toLowerCase();
        const isAuthorEmailMatch = authorEmail && userEmailsLower.includes(authorEmail);
        const isCommitterEmailMatch = committerEmail && userEmailsLower.includes(committerEmail);

        const commitMessage = commit.commit?.message || "";
        const coAuthoredPattern = /co-authored-by:\s*(.+?)\s*<(.+?)>/gi;
        const coAuthors: string[] = [];
        let match;
        while ((match = coAuthoredPattern.exec(commitMessage)) !== null) {
          const coAuthorEmail = match[2]?.toLowerCase();
          if (coAuthorEmail) {
            coAuthors.push(coAuthorEmail);
          }
        }
        const isCoAuthorMatch = coAuthors.some(email => userEmailsLower.includes(email));

        const isMergeCommit = commit.commit?.message?.startsWith("Merge") || 
                             commit.commit?.parents?.length > 1;

        const isUserCommit = isAuthorMatch || isCommitterMatch || 
                           isAuthorEmailMatch || isCommitterEmailMatch || 
                           isCoAuthorMatch;

        if (isMergeCommit && !isAuthorMatch && !isAuthorEmailMatch) {
          return false;
        }

        if (isUserCommit) {
          seenCommitSHAs.add(commitSHA);
          return true;
        }

        return false;
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
      console.error(`Error fetching commits for ${repoFullName}${branch ? ` (branch: ${branch})` : ""} page ${page}:`, error);
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

  // Get user emails for better commit matching
  const user = await fetchGitHubUser(accessToken);
  const userEmails = user.emails || [];

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
          endDate,
          userEmails, // Pass user emails for better matching
          (repo as any).fork || false // Pass fork status
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
      fork: repo.fork || false, // Store fork status
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
  endDate: string,
  isFork: boolean = false
): Promise<number> {
  // GitHub doesn't count commits in forks
  if (isFork) {
    return 0;
  }

  // Track unique commits by SHA to avoid counting duplicates
  // (public API returns commits from all branches when sha is not specified)
  const seenCommitSHAs = new Set<string>();
  let totalCommits = 0;
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      // Try with author filter first
      // Note: Public API without sha parameter returns commits from all branches
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
        // 409 Conflict usually means empty repository or no commits in the date range
        if (response.status === 403 || response.status === 404 || response.status === 409) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      // Filter commits by author username and track unique commits by SHA
      const userCommits = commits.filter((commit: any) => {
        const commitSHA = commit.sha;
        
        // Skip if we've already counted this commit
        if (seenCommitSHAs.has(commitSHA)) {
          return false;
        }

        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const userLower = username.toLowerCase();
        const isMatch = authorLogin === userLower || committerLogin === userLower;

        if (isMatch) {
          seenCommitSHAs.add(commitSHA);
          return true;
        }

        return false;
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
  endDate: string,
  isFork: boolean = false
): Promise<Date[]> {
  // GitHub doesn't count commits in forks
  if (isFork) {
    return [];
  }

  const commitDates: Date[] = [];
  const seenCommitSHAs = new Set<string>();
  let page = 1;
  const perPage = 100;

  while (true) {
    try {
      // Public API without sha parameter returns commits from all branches
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
        // 409 Conflict usually means empty repository or no commits in the date range
        if (response.status === 403 || response.status === 404 || response.status === 409) {
          break;
        }
        throw new Error(`Failed to fetch commits: ${response.status}`);
      }

      const commits = await response.json();
      
      if (commits.length === 0) {
        break;
      }

      const userCommits = commits.filter((commit: any) => {
        const commitSHA = commit.sha;
        
        // Skip if we've already counted this commit
        if (seenCommitSHAs.has(commitSHA)) {
          return false;
        }

        const authorLogin = commit.author?.login?.toLowerCase();
        const committerLogin = commit.committer?.login?.toLowerCase();
        const userLower = username.toLowerCase();
        const isMatch = authorLogin === userLower || committerLogin === userLower;

        if (isMatch) {
          seenCommitSHAs.add(commitSHA);
          return true;
        }

        return false;
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
          endDate,
          (repo as any).fork || false // Pass fork status
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
  // First, fetch user info to get verified email addresses
  // GitHub counts contributions based on email addresses associated with the account
  const user = await fetchGitHubUser(accessToken);
  const userEmails = user.emails || [];
  
  console.log(`User: ${username}, Verified emails: ${userEmails.length > 0 ? userEmails.join(", ") : "none"}`);
  
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
          endDateStr,
          userEmails, // Pass user emails for better matching
          (repo as any).fork || false // Pass fork status (GitHub doesn't count commits in forks)
        );
        totalCommits += commits;
        if (commits > 0) {
          console.log(`✓ ${repo.full_name}: ${commits} commits (from all branches)`);
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

  // Fetch commit dates for timeline from ALL repos with commits
  // This ensures accurate timeline representation
  const allCommitDates: Date[] = [];
  const reposWithCommitsForTimeline = reposWithCommits.filter(r => (r.commits_count || 0) > 0);
  
  console.log(`Fetching commit dates from ${reposWithCommitsForTimeline.length} repos for timeline...`);
  
  // Process repos in batches to get commit dates
  const timelineBatchSize = 10;
  for (let i = 0; i < reposWithCommitsForTimeline.length; i += timelineBatchSize) {
    const batch = reposWithCommitsForTimeline.slice(i, i + timelineBatchSize);
    
    const batchPromises = batch.map(async (repo) => {
      try {
        const dates = await fetchCommitsWithDatesFromRepo(
          accessToken,
          repo.full_name,
          username,
          startDateStr,
          endDateStr,
          userEmails, // Pass user emails for better matching
          (repo as any).fork || false // Pass fork status (GitHub doesn't count commits in forks)
        );
        return dates;
      } catch (error) {
        console.error(`Error fetching commit dates for ${repo.full_name}:`, error);
        return [];
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach(dates => allCommitDates.push(...dates));
    
    // Small delay to avoid rate limits
    if (i + timelineBatchSize < reposWithCommitsForTimeline.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`Fetched ${allCommitDates.length} commit dates for timeline`);

  // Filter commit dates to ensure they're within the date range
  const filteredCommitDates = allCommitDates.filter((date) => {
    return date >= startDate && date <= endDate;
  });

  // Group commits by month based on actual date range (startDate to endDate)
  const monthCounts: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  filteredCommitDates.forEach((date) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  // Generate timeline from startDate to endDate (last 365 days)
  const commitTimeline: { month: string; commits: number }[] = [];
  
  // Start from startDate and go month by month until endDate
  const currentMonth = new Date(startDate);
  currentMonth.setDate(1); // Start of the month
  
  while (currentMonth <= endDate) {
    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const monthName = monthNames[currentMonth.getMonth()];
    
    commitTimeline.push({
      month: monthName,
      commits: monthCounts[monthKey] || 0,
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  console.log(`Timeline generated with ${commitTimeline.length} months, total commits: ${filteredCommitDates.length}`);

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
          endDateStr,
          (repo as any).fork || false // Pass fork status
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

  // Fetch commit dates for timeline from ALL repos with commits
  // This ensures accurate timeline representation
  const allCommitDates: Date[] = [];
  const reposWithCommitsForTimeline = reposWithCommits.filter(r => (r.commits_count || 0) > 0);
  
  console.log(`Fetching commit dates from ${reposWithCommitsForTimeline.length} repos for timeline...`);
  
  // Process repos in batches to get commit dates (smaller batches for public API)
  const timelineBatchSize = 5;
  for (let i = 0; i < reposWithCommitsForTimeline.length; i += timelineBatchSize) {
    const batch = reposWithCommitsForTimeline.slice(i, i + timelineBatchSize);
    
    // Process sequentially for public API to avoid rate limits
    for (const repo of batch) {
      try {
        const dates = await fetchPublicCommitsWithDatesFromRepo(
          repo.full_name,
          username,
          startDateStr,
          endDateStr,
          (repo as any).fork || false // Pass fork status
        );
        allCommitDates.push(...dates);
        
        // Delay between requests for unauthenticated API
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error fetching commit dates for ${repo.full_name}:`, error);
      }
    }
  }

  console.log(`Fetched ${allCommitDates.length} commit dates for timeline`);

  // Filter commit dates to ensure they're within the date range
  const filteredCommitDates = allCommitDates.filter((date) => {
    return date >= startDate && date <= endDate;
  });

  // Group commits by month based on actual date range (startDate to endDate)
  const monthCounts: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  filteredCommitDates.forEach((date) => {
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
  });

  // Generate timeline from startDate to endDate (last 365 days)
  const commitTimeline: { month: string; commits: number }[] = [];
  
  // Start from startDate and go month by month until endDate
  const currentMonth = new Date(startDate);
  currentMonth.setDate(1); // Start of the month
  
  while (currentMonth <= endDate) {
    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const monthName = monthNames[currentMonth.getMonth()];
    
    commitTimeline.push({
      month: monthName,
      commits: monthCounts[monthKey] || 0,
    });
    
    // Move to next month
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  console.log(`Timeline generated with ${commitTimeline.length} months, total commits: ${filteredCommitDates.length}`);

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

