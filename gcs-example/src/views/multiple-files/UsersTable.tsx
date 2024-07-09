import { useMemo } from "react";
import { Badge, Table } from "@basemachina/view";

const users = [
  {
    id: 1,
    name: "山下 桃子",
    status: "登録済み",
    address: "岐阜県武蔵野市芝大門14丁目27番4号 コート元浅草515",
    email: "htanaka@example.org",
    created_at: "1984-03-22 12:52:03",
  },
  {
    id: 2,
    name: "伊藤 太郎",
    status: "未登録",
    address: "鹿児島県袖ケ浦市九段南16丁目7番16号",
    email: "takahashitakuma@example.com",
    created_at: "1981-09-18 23:11:55",
  },
  {
    id: 3,
    name: "太田 花子",
    status: "削除済み",
    address: "福岡県袖ケ浦市猿楽町18丁目27番6号 竜泉シャルム061",
    email: "yokohashimoto@example.org",
    created_at: "1974-12-29 12:38:39",
  },
] as const;

const statusColor = {
  登録済み: "green",
  未登録: "gray",
  削除済み: "red",
} as const;

const columnNames = {
  id: "ユーザーID",
  name: "氏名",
  address: "住所",
  email: "メールアドレス",
  status: "ステータス",
  created_at: "登録日時",
} as const;

export const UsersTable = () => {
  const rows = useMemo(() => {
    return users.map((user) => {
      return {
        ...user,
        status: <Badge title={user.status} color={statusColor[user.status]} />,
      };
    });
  }, [users]);

  return <Table rows={rows} columnNames={columnNames} />;
};
