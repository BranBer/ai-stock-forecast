import { Skeleton } from "@mui/material";
import { ResponsiveLine } from "@nivo/line";

const LineChart = ({ data }) => {
  return data && data.length && data[0].data ? (
    <ResponsiveLine
      data={data}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
      enableGridX={false}
      enableGridY={false}
      animate={false}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      enablePoints={false}
      yFormat=" >-.2f"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        orient: "bottom",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "date",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        orient: "left",
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "price",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointLabelYOffset={-12}
      useMesh={true}
      isInteractive={true}
    />
  ) : (
    <Skeleton />
  );
};

export default LineChart;
