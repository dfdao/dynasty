import { useState } from "react";
import "./App.css";
import styled from "styled-components";
import DateTimePicker from "react-datetime-picker";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

interface ScoringInterface {
  configHash: string;
  timeScoreWeight: number;
  moveScoreWeight: number;
  winner: number | undefined;
  startTime: number;
  endTime: number;
}

const DEFAULT_SCORING_CONFIG: ScoringInterface = {
  configHash: "",
  timeScoreWeight: 1,
  moveScoreWeight: 1,
  winner: undefined,
  startTime: new Date().getTime(),
  endTime: new Date().getTime(),
};

type AuthStatus = "authenticated" | "unauthenticated" | "loading";

function App() {
  const [currentConfig, setCurrentConfig] = useState<ScoringInterface>(
    DEFAULT_SCORING_CONFIG
  );
  const { address, isConnected } = useAccount();
  const [selectedFile, setSelectedFile] = useState();

  const changeHandler = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  return (
    <Container>
      <Nav>
        <Title>Dynasty Admin</Title>

        <ConnectButton />
      </Nav>
      <Title style={{ marginBottom: "1rem" }}>Create new Round</Title>
      <Form>
        <FormItem>
          <Label>Scoring Formula</Label>
          <FormulaContainer>
            <GreenFormulaInput
              placeholder="timeScoreWeight"
              onChange={(e) => {
                setCurrentConfig({
                  ...currentConfig,
                  timeScoreWeight: Number(e.target.value),
                });
              }}
              type="number"
            />
            <span>* playerTime * (1 + (</span>
            <BlueFormulaInput
              placeholder="moveScoreWeight"
              onChange={(e) => {
                setCurrentConfig({
                  ...currentConfig,
                  moveScoreWeight: Number(e.target.value),
                });
              }}
              type="number"
            />
            <span> * playerMoves) / 1000)</span>
          </FormulaContainer>
        </FormItem>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            width: "100%",
          }}
        >
          <FormItem>
            <Label>Start Time</Label>
            <DateTimePicker
              onChange={(date: Date) =>
                setCurrentConfig({
                  ...currentConfig,
                  startTime: date.getUTCMilliseconds(),
                })
              }
              value={new Date(currentConfig.startTime)}
            />
          </FormItem>
          <FormItem>
            <Label>End Time</Label>
            <DateTimePicker
              onChange={(date: Date) =>
                setCurrentConfig({
                  ...currentConfig,
                  endTime: date.getUTCMilliseconds(),
                })
              }
              value={new Date(currentConfig.endTime)}
            />
          </FormItem>
        </div>
        <Label>Dates are in your current time zone.</Label>
        <FormItem>
          <Label>Upload Config (JSON)</Label>
          <FileInput
            type="file"
            accept="application/JSON"
            name="file"
            onChange={changeHandler}
          />
        </FormItem>
        <FormItem>
          <button disabled={!isConnected}>Submit new round</button>
          {!isConnected && (
            <span>
              Connect wallet. Only an authenticated community admin can
              add/remove new rounds.
            </span>
          )}
        </FormItem>
      </Form>
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

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e3cca0;
  border-radius: 0.5rem;
  padding: 1rem;
  align-items: center;
  justify-content: center;
`;

const Label = styled.label`
  width: 100%;
  text-align: left;
`;

const FormulaContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border: 1px solid #e3cca0;
  border-radius: 4px;
`;

const FormulaInput = styled.input`
  padding: 4px;
  border-radius: 4px;
  background: #1c1c1c;
  text-decoration: none;
  outline: none;
  border: none;
  background: #ccc;
`;

const GreenFormulaInput = styled(FormulaInput)`
  background: rgba(64, 221, 155, 0.4);
  color: #0b4e32;
  ::-webkit-input-placeholder {
    color: #0b4e32;
  }
`;

const BlueFormulaInput = styled(FormulaInput)`
  background: rgba(97, 198, 255, 0.4);
  color: #0f5a9f;
  ::-webkit-input-placeholder {
    color: #0f5a9f;
  }
`;

const Title = styled.span`
  font-family: sans-serif;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.06em;
`;

const Nav = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
`;

const FileInput = styled.input`
  background: rgba(234, 215, 176, 1);
  padding: 8px;
  border-radius: 4px;
  color: #7c735f;
  border: 2px solid #7c735f;
`;

export default App;
