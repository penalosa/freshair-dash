module.exports = {
  domain: "freshair.org.uk",
  namespaces: ["secrets", "users", "repos"],
  dependencies: {
    jsonwebtoken: "^8.5.1"
  },
  handlers: (
    { json, html, text },
    { secrets, users, repos },
    { jsonwebtoken: jwt }
  ) => ({
    post: {
      "/auth/:code": async (req, { code }, log) => {
        let accessToken = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            method: "POST",
            body: JSON.stringify({
              client_id: await secrets.get("GH_CLIENT_ID"),
              client_secret: await secrets.get("GH_CLIENT_SECRET"),
              code
            })
          }
        ).then(r => r.json());
        return json(at);
      }
    },
    get: {
      // Depreciated
      "/start": async (req, _, log) => {
        let id = await secrets.get("GH_CLIENT_ID");
        log.info("Authorization url requested");
        return json({
          url: `https://github.com/login/oauth/authorize?scope=repo%20user%20workflow&client_id=${id}`
        });
      },
      // Github Hook
      "/oauth": async (req, _) => {
        let code = new URL(req.url).searchParams.get("code");
        log.info(`Authorized GH Oauth, redirecting to dashboard`);
        let htm = `
      <code>
      ${code}"
      </code>
      `;
        return html(htm);
      },

      "/profile": async (req, { code }, log) => {
        let token = req.headers.get("X-Auth-Token");
        let profile = await fetch("https://api.github.com/user", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "User-Agent": "Cloudflare Worker",
            Authorization: `token ${token}`
          }
        }).then(r => r.json());
        return json(profile);
      },
      "/repos/:owner/:name": async (req, { owner, name }, log) => {
        let token = req.headers.get("X-Auth-Token");
        const repo = await fetch(
          `https://api.github.com/repos/${owner}/${name}`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "Cloudflare Worker",
              Authorization: `token ${token}`
            }
          }
        ).then(r => r.json());
        let s_keys = await secrets.list({ prefix: `${owner}/${name}:` });
        let s_values = await Promise.all(
          s_keys.keys.map(async k => {
            return {
              key: k.name
                .split(":")
                .slice(1)
                .join(":"),
              val: await secrets.get(k.name)
            };
          })
        );
        return json({ ...repo, worker: { secrets: s_values } });
      },
      "/repos/active": async (req, _, log) => {
        let token = req.headers.get("X-Auth-Token");
        let active_repos = await repos.list();

        const reps = await Promise.all(
          active_repos.keys.map(
            async r =>
              await fetch(`https://api.github.com/repos/${r.name}`, {
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "User-Agent": "Cloudflare Worker",
                  Authorization: `token ${token}`
                }
              }).then(r => r.json())
          )
        );
        return json(reps);
      },
      "/repos/:n": async (req, { n }, log) => {
        let token = req.headers.get("X-Auth-Token");
        const repos = await fetch(
          `https://api.github.com/user/repos?page=${n}&per_page=100`,
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "User-Agent": "Cloudflare Worker",
              Authorization: `token ${token}`
            }
          }
        ).then(r => r.json());

        return json({ repos, next: `/repos/${n + 1}` });
      }
    }
    // post: {
    //   "/repos/:owner/:name/secrets": async (req, { owner, name }, log) => {
    //     let body = await req.json();
    //     await secrets.put(`${owner}/${name}:${body.key}`, body.val);
    //     return json(body);
    //   },
    //   "/workers/new/:name": async (req, { name }, log) => {
    //     let token = req.headers.get("X-Auth-Token");
    //     let profile = await fetch("https://api.github.com/user", {
    //       headers: {
    //         "Content-Type": "application/json",
    //         Accept: "application/json",
    //         "User-Agent": "Cloudflare Worker",
    //         Authorization: `token ${token}`
    //       }
    //     }).then(r => r.json());
    //     const repo = await fetch(
    //       `https://api.github.com/repos/penalosa/simple-worker-template/generate`,
    //       {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           Accept: "application/vnd.github.baptiste-preview+json",
    //           "User-Agent": "Cloudflare Worker",
    //           Authorization: `token ${token}`
    //         },
    //         body: JSON.stringify({
    //           owner: profile.login,
    //           name: name,
    //           description: "Cloudflare Workers",
    //           private: false
    //         })
    //       }
    //     ).then(r => r.json());
    //     await repos.put(`${profile.login}/${name}`, JSON.stringify(repo));
    //     return json(repo);
    //   }
    // }
  })
};
