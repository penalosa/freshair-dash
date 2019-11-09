import React, { useState, useEffect } from "react";
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
  Loader,
  Input,
  Dimmer
} from "semantic-ui-react";
import "semantic-ui-less/semantic.less";
import "./App.css";
import Fuse from "fuse.js";
const styles = {
  menu: {
    marginTop: "2em"
  },
  segment: {
    marginTop: "2em",
    marginBottom: "2em"
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
const options = {
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,
  keys: ["v.url", "v.content", "v.ip", "v.method", "v.type"]
};
const Long = ({
  match: {
    params: { user, repo, service, domain }
  }
}) => {
  const [logs, setLogs] = useState(null);
  const [fuse, setFuse] = useState(null);
  const [term, setTerm] = useState("");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState(null);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  useEffect(() => {
    fetch(`https://logs.${domain}/prefix/${service}.${domain}`)
      .then(r => r.json())
      .then(j => setLogs(j));
  }, [service]);
  useEffect(() => {
    if (logs) {
      const fuse = new Fuse(logs.values, options);
      window.fuse = fuse;
      setFuse(fuse);
    }
  }, [logs]);

  useEffect(() => {
    setSearching(true);
    if (fuse) {
      const result = fuse.search(term);
      setResult(result);
    }
    setSearching(false);
  }, [term]);
  const loadMore = () => {
    setIsLoadingMore(true);
    fetch(
      `https://logs.${domain}/prefix/cursor/${service}.${domain}/${logs.cursor}`
    )
      .then(r => r.json())
      .then(j => {
        setLogs({
          list_complete: j.list_complete,
          cursor: j.cursor,
          values: [...logs.values, ...j.values]
        });
        setIsLoadingMore(false);
      });
  };
  return (
    <>
      <Container style={styles.segment}>
        <Segment>
          <Input
            loading={searching}
            onChange={e => setTerm(e.target.value || "")}
            placeholder="Filter logs..."
            fluid
          />
        </Segment>
      </Container>
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
              (term && term.length && result ? result : logs.values).map(
                (l, n) => (
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
                )
              )}
          </Feed>
          {logs && !logs.list_complete ? (
            <Button color="blue" fluid onClick={loadMore}>
              {isLoadingMore ? (
                <Loader active inline="centered" inverted />
              ) : (
                "Load more"
              )}
            </Button>
          ) : null}
        </Segment>
      </Container>
    </>
  );
};

export default Long;
