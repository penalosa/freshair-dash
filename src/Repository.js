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
  Loader,
  Form,
  Table
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
const fakeDeployedDetails = {
  deployed_url: `api.penalosa.dev`,
  secrets: [
    {
      key: "GH_CLIENT_ID",
      val: "..."
    },
    {
      key: "GH_CLIENT_SECRET",
      val: "..."
    }
  ]
};
const Repository = ({
  match: {
    params: { owner, repo_name }
  }
}) => {
  const [repo, setRepo] = useState(null);
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");

  const [accessToken, setAccessToken] = useLocalStorage("access_token", null);
  const addSecret = async () => {
    let s = await fetch(
      `https://github.freshair.org.uk/repos/${owner}/${repo_name}/secrets`,
      {
        method: "POST",
        body: JSON.stringify({ key, val }),
        headers: { "X-Auth-Token": accessToken }
      }
    ).then(r => r.json());
    setKey("");
    setVal("");
    setRepo({
      ...repo,
      worker: { ...repo.worker, secrets: [...repo.worker.secrets, s] }
    });
  };
  useEffect(() => {
    (async () => {
      if (accessToken) {
        let repo = await fetch(
          `https://github.freshair.org.uk/repos/${owner}/${repo_name}`,
          {
            headers: { "X-Auth-Token": accessToken }
          }
        ).then(r => r.json());
        setRepo(repo);
      }
    })();
  }, [owner, repo_name]);
  return (
    <Container style={styles.segment}>
      <Segment loading={!repo}>
        {repo && (
          <>
            <Header as="h2">
              <Breadcrumb size="big">
                <Breadcrumb.Section link>{repo.owner.login}</Breadcrumb.Section>
                <Breadcrumb.Divider icon="right chevron" />
                <Breadcrumb.Section link>{repo.name}</Breadcrumb.Section>
              </Breadcrumb>
              <Header.Subheader>
                <em>{repo.worker.deployed_url}</em>
              </Header.Subheader>
            </Header>
            <Header as="h3">Secrets</Header>
            <Table color="black">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Key</Table.HeaderCell>
                  <Table.HeaderCell>Value</Table.HeaderCell>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {repo.worker.secrets.map(s => (
                  <Table.Row>
                    <Table.Cell>{s.key}</Table.Cell>
                    <Table.Cell>{s.val}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
            <Form onSubmit={addSecret}>
              <Form.Group>
                <Form.Input
                  placeholder="Key"
                  name="key"
                  value={key}
                  fluid
                  width="7"
                  onChange={e => setKey(e.target.value)}
                />
                <Form.Input
                  placeholder="Value"
                  name="val"
                  value={val}
                  fluid
                  width="7"
                  onChange={e => setVal(e.target.value)}
                />
                <Form.Button fluid width="2" content="Add" />
              </Form.Group>
            </Form>
          </>
        )}
      </Segment>
    </Container>
  );
};

export default Repository;
