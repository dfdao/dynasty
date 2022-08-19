import React from "react";
import { Formik, useField, useFormikContext } from "formik";
import { DEFAULT_SCORING_CONFIG } from "../constants";
import styled from "styled-components";
import DateTimePicker from "react-datetime-picker";
import { useAccount, useContractWrite } from "wagmi";
import { configHashGraphQuery } from "../lib/graphql";
import { ErrorBanner } from "./ErrorBanner";
import { abi } from "@dfdao/gp-registry/out/Registry.sol/Registry.json";
import { registry } from "@dfdao/gp-registry/deployment.json";

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

export const NewRoundForm: React.FC = () => {
  const { isConnected } = useAccount();
  const { write: addRound } = useContractWrite({
    mode: "recklesslyUnprepared",
    addressOrName: registry,
    contractInterface: abi,
    functionName: "addGrandPrix",
  });

  return (
    <Formik
      initialValues={DEFAULT_SCORING_CONFIG}
      onSubmit={async (values) => {
        const v = {
          startTime: values.startTime,
          endTime: values.endTime,
          configHash: values.configHash,
          timeWeight: 1,
          scoreWeight: 1,
          silverWeight: 1,
          parentAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        };
        addRound({
          recklesslySetUnpreparedArgs: [...Object.values(v)],
        });
      }}
      validate={async (values) => {
        const errors = {} as { [key: string]: string };

        // Validate configHash
        const configHashStartsWith0x = values.configHash.startsWith("0x");
        if (values.configHash.length == 66) {
          if (!configHashStartsWith0x) {
            errors["configHashPrefix"] = "Config hash must start with 0x";
          } else {
            const error = await configHashGraphQuery(values.configHash);
            if (error) {
              errors["configHashGraphQL"] =
                "Config hash doesn't exist on-chain.";
            }
          }
        } else {
          errors["configHash"] = "Config hash is required.";
        }

        if (values.description.length === 0) {
          errors["description"] = "Description is required.";
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
          <FormItem>
            <button
              disabled={!isConnected || Object.keys(formik.errors).length > 0}
              className="btn"
              type="submit"
            >
              Submit new round
            </button>
            {Object.keys(formik.errors).length > 0 && isConnected && (
              <ErrorBanner>
                {Object.values(formik.errors).map((error) => (
                  <span key={error}>🚫 {error}</span>
                ))}
              </ErrorBanner>
            )}
            {/* {submissionError && isConnected && (
              <ErrorBanner>
                <span>🚫 {JSON.parse(submissionError).message}</span>
              </ErrorBanner>
            )} */}
            {!isConnected && (
              <span>
                Connect wallet. Only a community admin can add/remove new
                rounds.
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

export const TextInput = styled.input`
  padding: 0.5rem 1rem;
  border: 1px solid rgb(53, 71, 73);
  border-radius: 2px;
  background: none;
  color: #fff;
  transition: border-color 0.2s ease-in-out;
  &:hover {
    border-color: rgba(45, 240, 159, 0.4);
  }
`;

const Label = styled.label`
  width: 100%;
  text-align: left;
  font-weight: 400;
  font-family: "Menlo", "Inconsolata", monospace;
  text-transform: uppercase;
  font-size: 0.8em;
  color: #aaa;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgb(53, 71, 73);
  background: rgb(32, 36, 37);
  border-radius: 6px;
  padding: 1rem;
  align-items: center;
  justify-content: center;
`;

const Picker = styled(DateTimePicker)`
  display: flex;
  align-items: flex-start;
  .react-datetime-picker__wrapper {
    flex-grow: 0;
    border-radius: 2px;
    border: 1px solid rgb(53, 71, 73);
    background: none;
    color: #fff;
    transition: border-color 0.2s ease-in-out;
    &:hover {
      border-color: rgba(45, 240, 159, 0.4);
    }
    .react-datetime-picker__inputGroup {
      padding: 0.5rem;
      color: #fff;
    }
    .react-datetime-picker__inputGroup__input {
      color: #fff;
    }
    .react-datetime-picker__button__icon {
      color: #fff;
      stroke: #fff;
    }
    .react-datetime-picker__clear-button {
      color: #fff;
    }
  }
  .react-calendar {
    border-radius: 4px;
    padding: 0.5rem;
  }
`;
