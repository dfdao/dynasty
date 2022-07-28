import React, { useEffect, useMemo, useState } from "react";
import { Formik, useField, useFormik, useFormikContext } from "formik";
import {
  DEFAULT_SCORING_CONFIG,
  getAddRoundMessage,
  getEditRoundMessage,
} from "../constants";
import styled from "styled-components";
import DateTimePicker from "react-datetime-picker";
import { useAccount, useSignMessage } from "wagmi";
import { useSWRConfig } from "swr";
import { configHashGraphQuery } from "../lib/graphql";
import { ErrorBanner } from "./ErrorBanner";
import { addRound, editRound } from "../lib/network";
import { ScoringInterface } from "../types";

export const DateTimeField = ({ ...props }: any) => {
  const { setFieldValue } = useFormikContext();
  const [field] = useField(props);
  return (
    <Picker
      {...props}
      value={new Date(field.value)}
      onChange={(val) => {
        setFieldValue(field.name, val.getTime());
      }}
    />
  );
};

export const NewRoundForm: React.FC<{
  editCurrentRound?: ScoringInterface;
}> = ({ editCurrentRound }) => {
  const { mutate } = useSWRConfig();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage({
    message: editCurrentRound
      ? getEditRoundMessage(address)
      : getAddRoundMessage(address),
  });
  const [submissionError, setSubmissionError] = useState<string | undefined>(
    undefined
  );

  const oldRound = useMemo(() => {
    if (editCurrentRound) {
      return editCurrentRound;
    }
  }, []);

  return (
    <Formik
      initialValues={editCurrentRound ?? DEFAULT_SCORING_CONFIG}
      onSubmit={async (values) => {
        if (submissionError) setSubmissionError(undefined);
        const signedMessage = await signMessageAsync();
        mutate(`http://localhost:3000/rounds`, async () => {
          let res: Response;
          if (editCurrentRound) {
            if (!oldRound) return;
            res = await editRound(values, oldRound, address, signedMessage);
          } else {
            res = await addRound(values, address, signedMessage);
          }
          const responseError = await res.text();
          console.log(res);
          console.log(responseError);
          if (res.status !== 200 && res.status !== 201) {
            setSubmissionError(responseError);
          }
        });
      }}
      validate={async (values) => {
        const errors = {} as any;

        // Validate configHash
        const configHashStartsWith0x = values.configHash.startsWith("0x");
        if (values.configHash.length == 66) {
          if (!configHashStartsWith0x) {
            errors["configHashPrefix"] = "Config hash must start with 0x";
          } else {
            let error = await configHashGraphQuery(values.configHash);
            if (error) {
              errors["configHashGraphQL"] =
                "Config hash doesn't exist on-chain.";
            }
          }
        } else {
          errors["configHash"] = "Config hash is required.";
        }

        // validate start and end times
        if (values.startTime > values.endTime) {
          errors["startTime"] = "Start time must be before end time.";
        }
        if (values.startTime === values.endTime) {
          errors["startEndEqual"] =
            "Start time and end time must be different.";
        }
        return errors;
      }}
    >
      {(formik) => (
        <Form onSubmit={formik.handleSubmit}>
          <FormItem>
            <Label>Scoring Formula</Label>
            <FormulaContainer>
              <FormulaInput
                placeholder="timeScoreWeight"
                id="timeScoreWeight"
                name="timeScoreWeight"
                onChange={formik.handleChange}
                type="number"
                value={formik.values.timeScoreWeight}
              />
              <span>× playerTime × (1 + (</span>
              <FormulaInput
                placeholder="moveScoreWeight"
                id="moveScoreWeight"
                name="moveScoreWeight"
                onChange={formik.handleChange}
                value={formik.values.moveScoreWeight}
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
              <DateTimeField name="startTime" />
            </FormItem>
            <FormItem>
              <Label>End Time</Label>
              <DateTimeField name="endTime" />
            </FormItem>
          </div>
          <Label>Dates are in your current time zone.</Label>
          <FormItem>
            <Label>Config Hash</Label>
            <TextInput
              type="text"
              id="configHash"
              name="configHash"
              value={formik.values.configHash}
              onChange={formik.handleChange}
              placeholder="0x..."
            />
          </FormItem>
          {editCurrentRound && (
            <FormItem>
              <Label>Winner</Label>
              <TextInput
                type="text"
                id="winner"
                name="winner"
                value={formik.values.winner}
                onChange={formik.handleChange}
                placeholder="0x..."
              />
            </FormItem>
          )}
          <FormItem>
            <button
              disabled={!isConnected || Object.keys(formik.errors).length > 0}
              type="submit"
            >
              {editCurrentRound ? "Edit Round" : "Submit new round"}
            </button>
            {Object.keys(formik.errors).length > 0 && isConnected && (
              <ErrorBanner>
                {Object.values(formik.errors).map((error) => (
                  <span>🚫 {error}</span>
                ))}
              </ErrorBanner>
            )}
            {submissionError && isConnected && (
              <ErrorBanner>
                <span>🚫 {submissionError}</span>
              </ErrorBanner>
            )}
            {!isConnected && (
              <span>
                Connect wallet. Only an authenticated community admin can
                add/remove new rounds.
              </span>
            )}
          </FormItem>
        </Form>
      )}
    </Formik>
  );
};

const FormItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
  width: 100%;
`;

const TextInput = styled.input`
  padding: 0.5rem 1rem;
  border: 2px solid #e5e5e5;
  border-radius: 4px;
  background: #fff;
  transition: border-color 0.2s ease-in-out;
  &:hover {
    border-color: #349dff;
  }
`;

const FormulaInput = styled(TextInput)`
  padding: 4px;
  text-decoration: none;
  outline: none;
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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e3cca0;
  border-radius: 0.5rem;
  padding: 1rem;
  align-items: center;
  justify-content: center;
`;

const Picker = styled(DateTimePicker)`
  display: flex;
  align-items: flex-start;
  .react-datetime-picker__wrapper {
    flex-grow: 0;
    border: 2px solid #e5e5e5;
    border-radius: 4px;
    background: #fff;
    transition: border-color 0.2s ease-in-out;
    &:hover {
      border-color: #349dff;
    }
    .react-datetime-picker__inputGroup {
      padding: 0.5rem;
      color: #3e5164;
    }
  }
  .react-calendar {
    border-radius: 4px;
    border: 2px solid #349dff;
    padding: 0.5rem;
  }
`;
