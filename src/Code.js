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
import { Redirect } from "react-router-dom";
import "semantic-ui-less/semantic.less";
import useLocalStorage from "./useLocalStorage";
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

const Code = ({
  match: {
    params: { code }
  }
}) => {
  const [accessToken, setAccessToken] = useLocalStorage("access_token", null);
  useEffect(() => {
    (async () => {
      let at = await fetch(`https://github.freshair.org.uk/token/${code}`).then(
        r => r.json()
      );
      if (at.access_token) {
        setAccessToken(at.access_token);
      }
    })();
  }, [code]);

  return (
    <Container textAlign="center">
      {accessToken ? <Redirect to="/" /> : <Loader active />}
    </Container>
  );
};

export default Code;
