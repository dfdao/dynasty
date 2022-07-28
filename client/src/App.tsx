import "./App.css";
import styled from "styled-components";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { RoundList } from "./components/RoundsList";
import { NewRoundForm } from "./components/NewRoundForm";

function App() {
  return (
    <Container>
      <Nav>
        <Title>Dynasty Admin</Title>
        <ConnectButton />
      </Nav>
      <Title>Create new Round</Title>
      <NewRoundForm />
      <Title>All rounds</Title>
      <RoundList />
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  margin: 1rem;
`;

const Title = styled.span`
  font-family: sans-serif;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
  margin-top: 1rem;
`;

const Nav = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export default App;
