//  https://mui.com/material-ui/customization/palette/?srsltid=AfmBOopM15k_45t1SqKSQcMrF455Q1yN_se8_RlEmc1TDgx77vvHn6yR
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0c343d",
    },
    secondary: {
      main: "#f50057",
    },
  },
  typography: {
    fontFamily: ["-apple-system", '"Segoe UI"', "Roboto", "sans-serif"].join(","),
  },
});

export default theme;
