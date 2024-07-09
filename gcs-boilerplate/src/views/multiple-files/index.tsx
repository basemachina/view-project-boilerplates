import { Alert, Flexbox, Heading, Box } from "@basemachina/view";
import { UsersTable } from "./UsersTable";

const App = () => {
  return (
    <Flexbox direction="col">
      <Heading text="サンプル画面" size="lg" />
      <Alert
        message="これはサンプルのコードを元にした画面です。ドキュメントを参考にして業務に沿った画面に変更してください。"
        color="yellow"
      />
      <Box width="full">
        <UsersTable />
      </Box>
    </Flexbox>
  );
};

export default App;
