import React, { useState, useEffect } from "react";
import { Route, Link, BrowserRouter as Router } from "react-router-dom";
import {
  Container,
  Menu,
  Icon,
  Segment,
  Breadcrumb,
  Header,
  Feed,
  Button,
  Label,
  Image,
  Grid,
  Dimmer,
  Loader
} from "semantic-ui-react";
import "semantic-ui-less/semantic.less";
import "./App.css";
import Brief from "./Brief.js";
import Long from "./Long.js";
import Code from "./Code.js";
import Repos from "./Repos";
import Repository from "./Repository";
import Workers from "./Workers";
import useLocalStorage from "./useLocalStorage";
const styles = {
  menu: {
    marginTop: "2em",
    marginBottom: "2em"
  },
  segment: {
    marginBottom: "2em"
  },
  faded: {
    color: "rgba(0, 0, 0, 0.4)"
  }
};

const App = props => {
  const [profile, setProfile] = useState(null);
  const [active, setActive] = useState("repos");
  const [loadingSignIn, setLoadingSignIn] = useState(false);
  const [accessToken, setAccessToken] = useLocalStorage("access_token", null);
  const authorizeGH = () => {
    setLoadingSignIn(true);
    fetch(`https://github.freshair.org.uk/start`)
      .then(r => r.json())
      .then(u => {
        window.location = u.url;
      });
  };
  useEffect(() => {
    (async () => {
      if (accessToken) {
        let profile = await fetch(`https://github.freshair.org.uk/profile`, {
          headers: { "X-Auth-Token": accessToken }
        }).then(r => r.json());
        console.log(profile);
        setProfile(profile);
      }
    })();
  }, []);
  return (
    <Router>
      {profile && (
        <Container style={styles.menu}>
          <Header as="h3">
            <Image circular src={profile.avatar_url} />{" "}
            <code>@{profile.login}</code>
          </Header>
        </Container>
      )}
      <Container style={styles.menu}>
        <Menu stackable>
          <Menu.Item>
            <Icon name="globe" />
          </Menu.Item>
          <Menu.Item
            as={Link}
            active={active === "repos"}
            onClick={() => setActive("repos")}
            to="/repos"
          >
            Repos
          </Menu.Item>

          <Menu.Item
            as={Link}
            active={active === "workers"}
            onClick={() => setActive("workers")}
            to="/workers"
          >
            Workers
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              <Button color="blue" onClick={authorizeGH}>
                {loadingSignIn ? "Loading..." : "Sign In"}
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
      </Container>
      <Route path="/repos" exact component={Repos} />
      <Route path="/workers" exact component={Workers} />
      <Route path="/repos/:owner/:repo_name" exact component={Repository} />

      <Route path="/logs/:user/:repo/:domain/:service" component={Long} />
      <Route path="/code/:code" component={Code} />
    </Router>
  );
};

export default App;
