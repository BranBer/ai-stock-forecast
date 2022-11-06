/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../providers/DataProvider";
import LineChart from "./LineChart";

const ChartPrediction = () => {
  const { points, predictions, testingPoints, timestepSize, futureStepSize } =
    useData();
  const [predictedData, setPredictedData] = useState([]);

  useEffect(() => {
    if (predictions)
      predictions.then((predictions) => {
        if (predictions && testingPoints) {
          let lastPredictions = predictions.slice(
            predictions.length - 1 - futureStepSize,
            predictions.length - 1
          );

          let lastPt = points[points.length - 1];
          let predictionData = [lastPt];
          console.log(lastPt);

          let predictionDate = new Date(lastPt.x);
          lastPredictions.forEach((pred) => {
            if (!isNaN(pred)) {
              let newDate = predictionDate.getDate() + 1;
              let weekday = predictionDate.getDay();

              if (weekday === 5) newDate = predictionDate.getDate() + 2;

              predictionDate.setDate(newDate);

              predictionData.push({
                x: predictionDate.toISOString().split("T")[0],
                y: pred,
              });
            }
          });

          setPredictedData(predictionData);
        }
      });
  }, [predictions, testingPoints, points]);

  const Visualiztion = useMemo(() => {
    let original =
      (points !== undefined && points.filter((v) => !isNaN(v.y))) || [];

    let predict =
      (predictedData !== undefined &&
        predictedData.filter((v) => !isNaN(v.y))) ||
      [];

    return (
      <LineChart
        data={[
          {
            id: "original",
            color: "hsl(133, 70%, 50%)",
            data: original.slice(
              original.length - 1 - timestepSize * 2,
              original.length - 1
            ),
          },
          {
            id: "prediction",
            color: "rgb(38, 217, 199)",
            data: predict,
          },
        ]}
      />
    );
  }, [points, predictedData]);

  return Visualiztion;
};

export default ChartPrediction;
