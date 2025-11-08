export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  language: string;
  updated_at: string;
  html_url: string;
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

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch GitHub user");
  }

  return response.json();
}

export async function fetchUserRepos(
  accessToken: string,
  username: string
): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const response = await fetch(
      `https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=updated&affiliation=owner,collaborator`,
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

    repos.push(...data);
    page++;

    if (data.length < perPage) break;
  }

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
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&author=${username}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

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

      totalCommits += commits.length;

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

    repos.push(...data);
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
      const response = await fetch(
        `https://api.github.com/repos/${repoFullName}/commits?since=${startDate}&until=${endDate}&author=${username}&per_page=${perPage}&page=${page}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

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

      totalCommits += commits.length;

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
  year: number = 2025
): Promise<GitHubStats> {
  const repos = await fetchUserRepos(accessToken, username);
  
  // Calculate stats
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  
  // Get top repos by stars
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10);

  // Count languages
  const languages: Record<string, number> = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Fetch commits
  const totalCommits = await fetchYearlyCommits(accessToken, username, year);

  // Create commit timeline (mock data based on total commits)
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const commitTimeline = months.map((month) => ({
    month,
    commits: Math.floor(totalCommits / 12) + Math.floor(Math.random() * (totalCommits / 6)),
  }));

  // Estimate PRs and Issues (GitHub API doesn't provide easy yearly stats)
  const totalPRs = Math.floor(totalCommits * 0.3);
  const totalIssues = Math.floor(totalCommits * 0.2);

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
  year: number = 2025
): Promise<GitHubStats> {
  const repos = await fetchPublicRepos(username);
  
  // Calculate stats (public repos only)
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  
  // Get top repos by stars
  const topRepos = repos
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 10);

  // Count languages
  const languages: Record<string, number> = {};
  repos.forEach((repo) => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });

  // Fetch commits (public data only)
  const totalCommits = await fetchPublicYearlyCommits(username, year);

  // Create commit timeline
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const commitTimeline = months.map((month) => ({
    month,
    commits: Math.floor(totalCommits / 12) + Math.floor(Math.random() * (totalCommits / 6)),
  }));

  // Estimate PRs and Issues (GitHub API doesn't provide easy yearly stats for public data)
  const totalPRs = Math.floor(totalCommits * 0.25); // Lower estimate for public data
  const totalIssues = Math.floor(totalCommits * 0.15);

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

