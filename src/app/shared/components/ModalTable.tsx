import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Table,
} from "antd";
import React from "react";
import Axios from "@/libs/axios";
import Title from "antd/es/typography/Title";
import { ColumnType } from "antd/es/table/interface";

interface NeonTable {
  table: string;
  key?: string | number;
}

type ModalTableProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  database: string;
};
export default function ModalTable({
  database,
  onClose,
  open,
}: ModalTableProps) {
  const title = `Table ${database}`;
  const [data, setData] = React.useState<NeonTable[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState({
    isShow: false,
    action: "",
  });
  const [form] = Form.useForm();
  const [oldTable, setOldTable] = React.useState("");
  const normalize = (input: any): NeonTable[] => {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr.map((item: any, index: number) => ({
      key: index,
      no: index + 1,
      table: item,
    }));
  };
  const fetchTables = async () => {
    try {
      const res = await Axios.get(`/table?databaseName=${database}`);
      console.log("response", res.data);

      if (res?.data?.success) {
        const tables = normalize(res.data.data);
        setData(tables);
      }
    } catch (err) {
      console.error("Error fetching Neon data:", err);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    form.resetFields();
    setIsModalOpen({
      action: "",
      isShow: false,
    });
  };

  const handleUpdate = (record: { table: string }) => {
    setIsModalOpen({
      action: "update",
      isShow: true,
    });

    setOldTable(record?.table);

    form.setFieldsValue({
      name: record?.table,
    });
  };

  const handleDelete = async (record: NeonTable) => {
    try {
      const res = await Axios.delete("/table", {
        data: { tableName: record.table, databaseName: database },
      });
      if (res.data.success) {
        message.success("Delete Database success");
        fetchTables();
      } else {
        message.error("Delete Database fail");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      if (isModalOpen.action === "create") {
        const values = await form.validateFields();
        const payload = {
          databaseName: database,
          tableName: values?.name,
        };
        const res = await Axios.post("/table", payload);
        if (res.data.success) {
          message.success("Create table success");
          fetchTables();
          closeModal();
        } else {
          message.error("Create table fail");
        }
      } else {
        const values = await form.validateFields();
        const payload = {
          newName: values?.name,
          oldName: oldTable,
          databaseName: database,
        };
        const res = await Axios.put(`/table`, payload);
        if (res.data.success) {
          message.success("Update table success");
          fetchTables();
          closeModal();
        } else {
          message.error("Update table fail");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (database) {
      fetchTables();
    }
  }, [database]);

  const columns: ColumnType[] = [
    {
      title: "No",

      dataIndex: "no",
      key: "no",
      width: 80,
      align: "center",
    },
    {
      title: "Table name",
      dataIndex: "table",
      key: "table",
      width: 250,
    },
    {
      title: "Tools",
      key: "tools",
      width: 220,
      render: (_: any, record: NeonTable) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="default"
            size="small"
            onClick={() => handleUpdate(record)}
          >
            แก้ไข
          </Button>
          <Popconfirm
            title={`คุณต้องการลบใช่หรือไม่ ?`}
            okText="ลบ"
            cancelText="ยกเลิก"
            okType="danger"
            onConfirm={async () => {
              await handleDelete(record);
            }}
          >
            <Button size="small" danger>
              ลบ
            </Button>
          </Popconfirm>
          <Button type="default" size="small">
            ตาราง
          </Button>
        </div>
      ),
    },
  ];

  if (!open) return null;

  return (
    <>
      <Modal
        title={title}
        open={open}
        onCancel={() => onClose(false)}
        width={800}
      >
        <Flex justify="end">
          <Button
            type="primary"
            onClick={() => setIsModalOpen({ isShow: true, action: "create" })}
          >
            สร้าง
          </Button>
        </Flex>
        <Title level={3}>Table</Title>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          loading={loading}
        />
      </Modal>
      <Modal
        title={isModalOpen?.action === "create" ? "สร้าง Table" : "แก้ไข Table"}
        open={isModalOpen.isShow}
        onOk={handleSave}
        onCancel={closeModal}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "กรุณากรอกชื่อ Table" }]}
          >
            <Input placeholder="ชื่อ Table" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
