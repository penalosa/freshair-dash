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
  Message,
  Image,
  Grid,
  Loader,
  Form
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
    marginBottom: "2em"
  },
  faded: {
    color: "rgba(0, 0, 0, 0.4)"
  }
};

const Repos = props => {
  const [repos, setRepos] = useState(null);
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [accessToken, setAccessToken] = useLocalStorage("access_token", null);
  const createRepo = async () => {
    setIsCreatingRepo(true);
    let repo = await fetch(
      `https://github.penalosa.dev/workers/new/${newRepoName}`,
      {
        method: "POST",
        headers: { "X-Auth-Token": accessToken }
      }
    ).then(r => r.json());
    setRepos([...repos, repo]);
    setIsCreatingRepo(false);
  };
  useEffect(() => {
    (async () => {
      if (accessToken) {
        let repos = await fetch(`https://github.penalosa.dev/repos/active`, {
          headers: { "X-Auth-Token": accessToken }
        }).then(r => r.json());
        console.log(repos);
        setRepos(repos);
      }
    })();
  }, []);
  return (
    <Container style={styles.segment}>
      <Segment>
        {repos ? (
          repos.length ? (
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
            <Message
              header="No active workers found"
              content="Create one now!"
            />
          )
        ) : (
          <Loader active inline="centered" />
        )}
        <Form onSubmit={createRepo}>
          <Form.Group>
            <Form.Input
              placeholder="example-cf-worker"
              name="name"
              value={newRepoName}
              fluid
              width="8"
              onChange={e => setNewRepoName(e.target.value)}
            />

            <Form.Button fluid color="blue" width="8">
              {isCreatingRepo ? (
                <Loader active inline="centered" inverted />
              ) : (
                "Create worker"
              )}
            </Form.Button>
          </Form.Group>
        </Form>
      </Segment>
    </Container>
  );
};

export default Repos;
