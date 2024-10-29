document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("github-form");
  const userList = document.getElementById("user-list");
  const reposList = document.getElementById("repos-list");
  const loading = document.getElementById("loading");
  const errorDiv = document.getElementById("error");
  const pagination = document.getElementById("pagination");
  const searchType = document.getElementById("search-type");

  let currentPage = 1;
  let searchTerm = "";
  let currentType = "users";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    searchTerm = document.getElementById("search").value;
    currentType = searchType.value;
    currentPage = 1;
    userList.innerHTML = "";
    reposList.innerHTML = "";
    errorDiv.classList.add("hidden");
    pagination.classList.add("hidden");

    try {
      displayLoading(true);
      await searchGitHub();
      displayLoading(false);
    } catch (error) {
      displayError("Failed to fetch results. Please try again.");
      displayLoading(false);
    }
  });

  document.getElementById("prev").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      searchGitHub();
    }
  });

  document.getElementById("next").addEventListener("click", () => {
    currentPage++;
    searchGitHub();
  });

  async function searchGitHub() {
    const url = currentType === "users" 
      ? `https://api.github.com/search/users?q=${searchTerm}&page=${currentPage}&per_page=5`
      : `https://api.github.com/search/repositories?q=${searchTerm}&page=${currentPage}&per_page=5`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    displayResults(data);
  }

  function displayResults(data) {
    userList.innerHTML = "";
    reposList.innerHTML = "";
    pagination.classList.remove("hidden");

    if (data.items.length === 0) {
      displayError("No results found.");
      return;
    }

    if (currentType === "users") {
      data.items.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `
          <img src="${user.avatar_url}" alt="${user.login}" />
          <div>
            <p><a href="${user.html_url}" target="_blank">${user.login}</a></p>
          </div>
        `;
        li.addEventListener("click", () => fetchRepos(user.login));
        userList.appendChild(li);
      });
    } else {
      data.items.forEach(repo => {
        const li = document.createElement("li");
        li.innerHTML = `
          <div>
            <p><a href="${repo.html_url}" target="_blank">${repo.name}</a> by ${repo.owner.login}</p>
          </div>
        `;
        reposList.appendChild(li);
      });
    }
  }

  async function fetchRepos(username) {
    const url = `https://api.github.com/users/${username}/repos`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    });
    const repos = await response.json();

    reposList.innerHTML = "";
    repos.forEach(repo => {
      const li = document.createElement("li");
      li.innerHTML = `<p><a href="${repo.html_url}" target="_blank">${repo.name}</a></p>`;
      reposList.appendChild(li);
    });
  }

  function displayLoading(show) {
    loading.classList.toggle("hidden", !show);
  }

  function displayError(message) {
    errorDiv.innerText = message;
    errorDiv.classList.remove("hidden");
  }
});
