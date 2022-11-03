import React, { createContext, useContext, useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

const DataContext = createContext({});

const normalize = (tensor) => {
  const min = tensor.min();
  const max = tensor.max();

  const normalizedTensor = tensor.sub(min).div(max.sub(min));
  return {
    tensor: normalizedTensor,
    max,
    min,
  };
};

// Look into these being undefined for predictions
const denormalize = (tensor, min, max) => {
  const denormalizedTensor = tensor.mul(max.sub(min)).add(min);
  return denormalizedTensor;
};

const prepareData = (data, timeWindowSize) => {
  let features = [];
  let labels = [];
  for (let i = 0; i < data.length - timeWindowSize; i++) {
    let sequence = data.slice(i, i + timeWindowSize).map(({ y }) => [y]);
    features.push(sequence);

    labels.push(data[i + timeWindowSize].y);
  }

  return {
    features: tf.tensor3d(features, [features.length, timeWindowSize, 1]),
    labels: tf.tensor2d(labels, [labels.length, 1]),
  };
};

const DataProvider = ({ children }) => {
  const timestepSize = 7;
  const [points, setPoints] = useState();

  const [testingPoints, setTestingPoints] = useState();

  const [normalizedFeatures, setNormalizedFeatures] = useState();
  const [normalizedLabels, setNormalizedLabels] = useState();
  const [testingFeatures, setTestingFeatures] = useState();
  const [trainingFeatures, setTrainingFeatures] = useState();
  const [testingLabels, setTestingLabels] = useState();
  const [trainingLabels, setTrainingLabels] = useState();

  const [trainingFeaturesMin, setTrainingFeaturesMin] = useState();
  const [trainingFeaturesMax, setTrainingFeaturesMax] = useState();

  const [trainingLabelsMin, setTrainingLabelsMin] = useState();
  const [trainingLabelsMax, setTrainingLabelsMax] = useState();

  const [testingFeaturesMin, setTestingFeaturesMin] = useState();
  const [testingFeaturesMax, setTestingFeaturesMax] = useState();

  const [testingLabelsMin, setTestingLabelsMin] = useState();
  const [testingLabelsMax, setTestingLabelsMax] = useState();

  const [predictions, setPredictions] = useState();
  useEffect(() => {
    const csv = tf.data.csv("http://127.0.0.1:3000/all_stocks_5yr.csv");

    // Get x, and y values
    tf.tidy(() => {
      csv
        .filter((record) => {
          return record.Name === "GOOGL";
        })
        .map((record) => ({ x: record.date, y: record.close }))
        .toArray()
        .then((res) => {
          let points = res;
          if (points.length % 2 !== 0) points.pop();

          let trainingData = points.slice(0, points.length / 2);
          let testingData = points.slice(points.length / 2 + 1, points.length);
          setTestingPoints(testingData);

          // I want to break the data up into sequences of 7 days
          // the number of sequences will be the dataset/7
          // not all the sequences will be the same size

          // The features will be the sequences that predict the label, the stock price of a given day that the sequence leads up to
          let featureVals = [];
          let labelVals = [];

          for (let i = 0; i < points.length - timestepSize; i++) {
            let sequence = points
              .slice(i, i + timestepSize)
              .map(({ y }) => [y]);
            featureVals.push(sequence);

            labelVals.push(points[i + timestepSize].y);
          }

          let { features: trainingFeatureTensor, labels: trainingLabelTensor } =
            prepareData(trainingData, timestepSize);
          let { features: testingFeatureTensor, labels: testingLabelTensor } =
            prepareData(testingData, timestepSize);

          // normalize data to be in between 0 and 1
          const {
            tensor: normTrainingFeaturesTensor,
            min: fMinTraining,
            max: fMaxTraining,
          } = normalize(trainingFeatureTensor);

          const {
            tensor: normTrainingLabelsTensor,
            min: lMinTraining,
            max: lMaxTraining,
          } = normalize(trainingLabelTensor);

          const {
            tensor: normTestingFeaturesTensor,
            min: fMinTesting,
            max: fMaxTesting,
          } = normalize(testingFeatureTensor);

          const {
            tensor: normTestingLabelsTensor,
            min: lMinTesting,
            max: lMaxTesting,
          } = normalize(testingLabelTensor);

          setPoints(points);
          setTrainingFeatures(normTrainingFeaturesTensor);
          setTrainingLabels(normTrainingLabelsTensor);
          setTestingFeatures(normTestingFeaturesTensor);
          setTestingLabels(normTestingLabelsTensor);

          setTrainingFeaturesMin(fMinTraining);
          setTrainingFeaturesMax(fMaxTraining);
          setTrainingLabelsMin(lMinTraining);
          setTrainingLabelsMax(lMaxTraining);

          setTestingFeaturesMin(fMinTesting);
          setTestingFeaturesMax(fMaxTesting);
          setTestingLabelsMin(lMinTesting);
          setTestingLabelsMax(lMaxTesting);

          console.log("Data is prepared");
        });
    });
  }, []);

  return (
    <DataContext.Provider
      value={{
        points,
        normalizedFeatures,
        normalizedLabels,
        testingFeatures,
        trainingFeatures,
        testingLabels,
        trainingLabels,
        trainingFeaturesMin,
        trainingFeaturesMax,
        trainingLabelsMin,
        trainingLabelsMax,
        testingFeaturesMin,
        testingFeaturesMax,
        testingLabelsMin,
        testingLabelsMax,
        timestepSize,
        testingPoints,
        denormalize,
        predictions,
        setPredictions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

const useData = () => {
  const data = useContext(DataContext);

  return data;
};

export { DataProvider, useData };
