import React, { createContext, useContext, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { useData } from "./DataProvider";

const ModelContext = createContext({});

const ModelProvider = ({ children }) => {
  const [model, setModel] = useState();
  const {
    points,
    normalizedFeatures,
    normalizedLabels,
    testingFeatures,
    trainingFeatures,
    testingLabels,
    trainingLabels,
    featuresMin,
    featuresMax,
    trainingLabelsMin,
    trainingLabelsMax,
    testingLabelsMin,
    testingLabelsMax,
    timestepSize,
    denormalize,
  } = useData();

  const trainModel = () => {
    if (trainingFeatures && trainingLabels)
      tf.tidy(() => {
        console.log("Model creation begun");
        const model = tf.sequential();
        model.add(
          tf.layers.lstm({
            units: 32,
            inputShape: [timestepSize, 1],
            useBias: true,
          })
        );
        model.add(tf.layers.dense({ units: 1 }));

        model.compile({
          loss: "meanSquaredError",
          optimizer: tf.train.adam(0.1),
        });

        model
          .fit(trainingFeatures, trainingLabels, {
            batchSize: 64,
            epochs: 25,
            validationSplit: 0.1,
            callbacks: [
              new tf.CustomCallback({
                onEpochEnd: async (epoch, logs) => {
                  if (logs)
                    console.log(
                      "Epoch: " +
                        epoch +
                        "\n Loss: " +
                        logs.loss +
                        "\n Accuracy: " +
                        logs.acc +
                        "\n Val Loss: " +
                        logs.val_loss +
                        "\n Val Accuracy: " +
                        logs.val_acc
                    );
                },
                onTrainEnd: async () => {
                  console.log("training done");
                },
              }),
              tf.callbacks.earlyStopping({ monitor: "loss" }),
            ],
          })
          .then(() => {
            setModel(model);
          });
      });
  };

  const predict = (predictionSet) => {
    if (model && predictionSet) {
      return denormalize(
        model.predict(predictionSet),
        testingLabelsMin,
        testingLabelsMax
      )
        .flatten()
        .array();
    }
  };

  return (
    <ModelContext.Provider value={{ model, trainModel, predict }}>
      {children}
    </ModelContext.Provider>
  );
};

const useModel = () => {
  const data = useContext(ModelContext);
  return data;
};

export { ModelProvider, useModel };
