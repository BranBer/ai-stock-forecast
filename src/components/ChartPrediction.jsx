/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useMemo } from "react";
import { useData } from "../providers/DataProvider";
import LineChart from "./LineChart";

const ChartPrediction = () => {
  const { points, predictions, testingPoints, timestepSize } = useData();
  const [testData, setTestData] = useState([]);

  useEffect(() => {
    if (predictions)
      predictions.then((predictions) => {
        if (predictions && testingPoints) {
          let startTestI = points.length - testingPoints.length + timestepSize;
          let count = 0;
          let predictionData = points.map((val, i) => {
            let newVal = { ...val };
            if (i >= startTestI) {
              newVal.y = +predictions[count];
              count++;
            } else newVal.y = 0;

            return newVal;
          });
          setTestData(predictionData);
        }
      });
  }, [predictions, testingPoints, points]);

  const Visualiztion = useMemo(() => {
    let original =
      (points !== undefined && points.filter((v) => !isNaN(v.y))) || [];

    let predict =
      (testData !== undefined && testData.filter((v) => !isNaN(v.y))) || [];

    return (
      <LineChart
        data={[
          {
            id: "original",
            color: "hsl(133, 70%, 50%)",
            data: original,
          },
          {
            id: "prediction",
            color: "rgb(38, 217, 199)",
            data: predict,
          },
        ]}
      />
    );
  }, [points, testData]);

  return Visualiztion;
};

export default ChartPrediction;
