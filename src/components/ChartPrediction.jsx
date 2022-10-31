import { Skeleton } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";
import { useData } from "../providers/DataProvider";
import LineChart from "./LineChart";

const ChartPrediction = () => {
  const { points, trainingLabels, denormalize } = useData();

  return (
    <LineChart
      data={[
        {
          id: "original",
          color: "red",
          data: points,
        },
      ]}
    />
  );
};

export default ChartPrediction;
