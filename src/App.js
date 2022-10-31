import "./App.css";
import ChartPrediction from "./components/ChartPrediction";
import { Button, Skeleton, Stack } from "@mui/material";
import { useData } from "./providers/DataProvider";
import { useModel } from "./providers/ModelProvider";

function App() {
  const { points, testingFeatures } = useData();
  const { trainModel, predict, setPredictions } = useModel();

  return (
    <Stack
      sx={{
        width: "100vw",
        height: "100vh",
        padding: "15px",
        overflow: "auto",
      }}
      direction="column"
      spacing={1}
    >
      {points ? (
        <Stack justifyContent="center" direction="row">
          <Button onClick={() => trainModel()}>Train model</Button>
          <Button
            onClick={() => {
              const predictions = predict(testingFeatures);
              console.log(predictions);
              setPredictions(predictions);
            }}
          >
            Predict
          </Button>
        </Stack>
      ) : (
        <Skeleton />
      )}
      <ChartPrediction />
    </Stack>
  );
}

export default App;
