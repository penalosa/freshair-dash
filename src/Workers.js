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
  Loader
} from "semantic-ui-react";
import "semantic-ui-less/semantic.less";
import "./App.css";

import useLocalStorage from "./useLocalStorage";
const styles = {
  menu: {
    marginTop: "2em",
    marginBottom: "2em"
  },
  segment: {
    marginBottom: "2em",
    textAlign: "center"
  },
  faded: {
    color: "rgba(0, 0, 0, 0.4)"
  }
};

const Workers = props => {
  const [repos, setRepos] = useState(null);
  const [accessToken, setAccessToken] = useLocalStorage("access_token", null);
  useEffect(() => {
    (async () => {
      if (accessToken) {
        let repos = await fetch(`https://github.penalosa.dev/repos/1`, {
          headers: { "X-Auth-Token": accessToken }
        }).then(r => r.json());
        console.log(repos);
        setRepos(repos.repos);
      }
    })();
  }, []);
  return (
    <Container style={styles.segment}>
      <Segment>
        {repos ? (
          repos.map(r => (
            <Button
              as={Link}
              to={`/repos/${r.owner.login}/${r.name}`}
              icon
              labelPosition="right"
              fluid
              style={{ marginBottom: "1em" }}
              className="left-button"
            >
              <Breadcrumb size="big">
                <Breadcrumb.Section link>{r.owner.login}</Breadcrumb.Section>
                <Breadcrumb.Divider icon="right chevron" />
                <Breadcrumb.Section link>{r.name}</Breadcrumb.Section>
              </Breadcrumb>
              <Icon name="right arrow" />
            </Button>
          ))
        ) : (
          <Loader active inline="centered" />
        )}
      </Segment>
    </Container>
  );
};

export default Workers;
