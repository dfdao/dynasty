import { useEffect, useState } from "react";
import "./App.css";
import styled from "styled-components";
import DateTimePicker from "react-datetime-picker";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSignMessage } from "wagmi";
import { getConfigName } from "./lib/getConfigName";
import { ethers } from "ethers";
import { formatStartTime, formatDate } from "./lib/date";
import { RoundList } from "./components/RoundsList";
import { getConfigsFromGraph } from "./lib/graphql";
import { useSWRConfig } from "swr";

export interface ScoringInterface {
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

type ValidationErrorType =
  | "configHashRequired"
  | "configHashInvalid"
  | "configHashNotFound"
  | "startTimeAfterEndTime"
  | "timeOverlaps"
  | "none";

function App() {
  const { mutate } = useSWRConfig();
  const [currentConfig, setCurrentConfig] = useState<ScoringInterface>(
    DEFAULT_SCORING_CONFIG
  );
  const { address, isConnected } = useAccount();
  const { data, isError, isSuccess, signMessage } = useSignMessage({
    message: `Adding new Grand Prix Round as ${address}`,
  });
  const [validationError, setValidationError] =
    useState<ValidationErrorType>("none");

  useEffect(() => {
    {
      async function graphQuery(configHash: string) {
        let x = await getConfigsFromGraph(configHash);
        if (!x.data) setValidationError("configHashNotFound");
        if (x.data?.arenas.length === 0)
          setValidationError("configHashNotFound");
      }
      if (currentConfig.configHash.length > 0) {
        graphQuery(currentConfig.configHash);
      }
    }
  }, [currentConfig]);

  function validateInput(input: ScoringInterface): ValidationErrorType {
    if (input.configHash.length === 0) {
      setValidationError("configHashRequired");
      return "configHashRequired";
    }
    if (!input.configHash.startsWith("0x")) {
      setValidationError("configHashInvalid");
      return "configHashInvalid";
    }
    if (input.startTime >= input.endTime) {
      setValidationError("startTimeAfterEndTime");
      return "startTimeAfterEndTime";
    }
    setValidationError("none");
    return "none";
  }

  useEffect(() => {
    validateInput(currentConfig);
  }, [currentConfig]);

  useEffect(() => {
    if (isSuccess) {
      mutate("http://localhost:3000/rounds", async () => {
        await fetch("http://localhost:3000/rounds", {
          method: "POST",
          body: JSON.stringify({
            signature: data,
            message: `Adding new Grand Prix Round as ${address}`,
            timeScoreWeight: currentConfig.timeScoreWeight,
            moveScoreWeight: currentConfig.moveScoreWeight,
            startTime: currentConfig.startTime,
            endTime: currentConfig.endTime,
            winner: currentConfig.winner,
            configHash: currentConfig.configHash,
          }),
        });
      });
    }
  }, [isSuccess]);

  return (
    <Container>
      <Nav>
        <Title>Dynasty Admin</Title>
        <ConnectButton />
      </Nav>
      <Title>Create new Round</Title>
      <Form>
        <FormItem>
          <Label>Scoring Formula</Label>
          <FormulaContainer>
            <GreenFormulaInput
              placeholder="timeScoreWeight"
              onChange={(e) => {
                const newConfig = {
                  ...currentConfig,
                  timeScoreWeight: Number(e.target.value),
                };
                setCurrentConfig(newConfig);
              }}
              type="number"
            />
            <span>× playerTime × (1 + (</span>
            <BlueFormulaInput
              placeholder="moveScoreWeight"
              onChange={(e) => {
                const newConfig = {
                  ...currentConfig,
                  moveScoreWeight: Number(e.target.value),
                };
                setCurrentConfig(newConfig);
              }}
              type="number"
            />
            <span> × playerMoves) ÷ 1000)</span>
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
              onChange={(date: Date) => {
                const newConfig = {
                  ...currentConfig,
                  startTime: date.getTime(),
                };
                setCurrentConfig(newConfig);
              }}
              value={new Date(currentConfig.startTime)}
            />
          </FormItem>
          <FormItem>
            <Label>End Time</Label>
            <DateTimePicker
              onChange={(date: Date) => {
                const newConfig = {
                  ...currentConfig,
                  endTime: date.getTime(),
                };
                setCurrentConfig(newConfig);
              }}
              value={new Date(currentConfig.endTime)}
            />
          </FormItem>
        </div>
        <Label>Dates are in your current time zone.</Label>
        <FormItem>
          <Label>Config Hash</Label>
          <input
            type="text"
            value={currentConfig.configHash}
            onChange={(e) => {
              const newConfig = {
                ...currentConfig,
                configHash: e.target.value,
              };
              setCurrentConfig(newConfig);
            }}
            placeholder="0x..."
          />
        </FormItem>
        <FormItem>
          <button
            disabled={!isConnected || validationError !== "none"}
            onClick={() => signMessage()}
          >
            Submit new round
          </button>
          {!isConnected && (
            <span>
              Connect wallet. Only an authenticated community admin can
              add/remove new rounds.
            </span>
          )}
        </FormItem>
        {validationError !== "none" && isConnected && (
          <ErrorBanner>
            {validationError === "configHashRequired" && (
              <span>Config hash is required.</span>
            )}
            {validationError === "configHashInvalid" && (
              <span>Config hash must start with '0x'.</span>
            )}
            {validationError === "startTimeAfterEndTime" && (
              <span>Start time must be before end time.</span>
            )}
            {validationError === "configHashNotFound" && (
              <span>Config doesn't exist onchain.</span>
            )}
            {validationError === "timeOverlaps" && (
              <span>Round time overlaps with existing round.</span>
            )}
          </ErrorBanner>
        )}
      </Form>
      <Title>All rounds</Title>
      <RoundList />
    </Container>
  );
}

const ErrorBanner = styled.div`
  display: flex;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  background: #ffc46b;
  color: #a05419;
`;

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
  margin-bottom: 1rem;
  margin-top: 1rem;
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
