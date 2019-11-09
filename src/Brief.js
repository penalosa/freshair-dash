import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Menu,
  Icon,
  Segment,
  Breadcrumb,
  Header,
  Feed,
  Button,
  Label
} from "semantic-ui-react";
import "semantic-ui-less/semantic.less";
import "./App.css";
const styles = {
  menu: {
    marginTop: "2em"
  },
  segment: {
    marginTop: "2em"
  },
  faded: {
    color: "rgba(0, 0, 0, 0.4)"
  }
};
const worstColour = l => {
  return l.find(log => log.type == "err")
    ? "red"
    : l.find(log => log.type == "warn")
    ? "yellow"
    : "blue";
};
const Brief = ({ user, repo, service, domain }) => {
  const [logs, setLogs] = useState(null);
  useEffect(() => {
    fetch(`https://logs.${domain}/brief/prefix/${service}.${domain}`)
      .then(r => r.json())
      .then(j => setLogs(j));
  }, [service]);
  return (
    <Container style={styles.segment}>
      <Segment loading={!logs}>
        <Header as="h2">
          <Breadcrumb size="big">
            <Breadcrumb.Section link>{user}</Breadcrumb.Section>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section link>{repo}</Breadcrumb.Section>
            <Breadcrumb.Divider icon="right chevron" />
            <Breadcrumb.Section active>{service}</Breadcrumb.Section>
          </Breadcrumb>
          <Header.Subheader>
            <em>
              {service}.{domain}
            </em>
          </Header.Subheader>
        </Header>

        <Feed>
          {logs &&
            logs.values.map((l, n) => (
              <>
                <Feed.Event key={n}>
                  <Feed.Content>
                    <Feed.Summary>
                      <Icon name="world" color={worstColour(l.v)} />
                      {l.v[0].method}{" "}
                      <span style={styles.faded}>{l.v[0].url}</span> from{" "}
                      <strong>{l.v[0].ip}</strong>
                      <Feed.Date>
                        {new Date(l.k.split("_")[1]).toLocaleString()}
                      </Feed.Date>
                    </Feed.Summary>
                  </Feed.Content>
                </Feed.Event>
                {l.v.slice(1).map((lo, nn) => (
                  <Feed.Event className="indent" key={`${n}-${nn}`}>
                    <Feed.Content>
                      <Feed.Summary>
                        {
                          {
                            warn: <Icon name="warning" color="yellow" />,
                            err: <Icon name="bug" color="red" />,
                            info: <Icon name="info" />
                          }[lo.type]
                        }{" "}
                        {lo.content}
                        <Feed.Date>
                          {" "}
                          {new Date(l.k.split("_")[1]).toLocaleString()}
                        </Feed.Date>
                      </Feed.Summary>
                    </Feed.Content>
                  </Feed.Event>
                ))}
              </>
            ))}
        </Feed>
        <Button
          color="blue"
          fluid
          as={Link}
          to={`/logs/${user}/${repo}/${domain}/${service}`}
        >
          See more
        </Button>
      </Segment>
    </Container>
  );
};

export default Brief;
