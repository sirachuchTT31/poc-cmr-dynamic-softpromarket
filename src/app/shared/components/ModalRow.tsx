import React from "react";
import { Column } from "./ModalColumn";
import Axios from "@/libs/axios";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
} from "antd";
import Table, { ColumnsType } from "antd/es/table";
import Title from "antd/es/typography/Title";

type ModalRowProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  table: string;
  database: string;
};

export default function ModalRow({
  database,
  onClose,
  open,
  table,
}: ModalRowProps) {
  const title = `Row in table : ${table}`;
  const [data, setData] = React.useState<any[]>([]);
  const [dataColumns, setDataColumns] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState({
    isShow: false,
    action: "",
  });
  const [autoId, setAutoId] = React.useState(null);
  const [form] = Form.useForm();
  const normalize = (input: any): any[] => {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr.map((item: any, index: number) => ({
      key: index,
      no: index + 1,
      ...item,
    }));
  };

  const fetchRows = async () => {
    try {
      const res = await Axios.get(
        `/row?databaseName=${database}&tableName=${table}`
      );
      console.log("response", res.data);

      if (res?.data?.success) {
        const columns = normalize(res.data.data);
        setData(columns);
      }
    } catch (err) {
      console.error("Error fetching Neon data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchColumns = async () => {
    try {
      const ignoreColumn = ["id", "created_at"];
      const res = await Axios.get(
        `/column?databaseName=${database}&tableName=${table}`
      );
      console.log("response", res.data);

      if (res?.data?.success) {
        const columns = res.data.data;
        setDataColumns(
          columns?.filter(
            (column: any) => !ignoreColumn.includes(column?.column_name)
          )
        );
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

  const handleUpdate = (record: any) => {
    setIsModalOpen({
      isShow: true,
      action: "update",
    });

    setAutoId(record.id);

    const values: Record<string, any> = {};
    dataColumns.forEach((col) => {
      values[col.column_name] = record[col.column_name];
    });

    form.setFieldsValue(values);
  };

  const handleSave = async () => {
    try {
      const values = form.getFieldsValue();

      if (isModalOpen.action === "create") {
        await Axios.post("/row", {
          databaseName: database,
          tableName: table,
          data: values,
        });
        message.success("Insert success");
      } else {
        const where = { id: autoId };
        await Axios.put("/row", {
          databaseName: database,
          tableName: table,
          data: values,
          where,
        });
        message.success("Update success");
      }
      closeModal();
      fetchRows();
    } catch (err: any) {
      message.error(err.message || "Error");
    }
  };

  const handleDelete = async (record: any) => {
    try {
      const where = { id: record.id };
      const res = await Axios.delete("/row", {
        data: {
          tableName: table,
          databaseName: database,
          where,
        },
      });
      if (res.data.success) {
        message.success("Delete column success");
        fetchRows();
      } else {
        message.error("Delete column fail");
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (database && table) {
      fetchRows();
      fetchColumns();
    }
  }, [database, table]);

  const renderInput = (col: Column) => {
    const type = col.data_type.toLowerCase();
    if (
      type.includes("int") ||
      type.includes("decimal") ||
      type.includes("numeric")
    ) {
      return <InputNumber style={{ width: "100%" }} />;
    } else {
      return <Input />;
    }
  };

  const tableColumns: ColumnsType<Column> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      align: "center",
    },
    ...dataColumns.map((col) => ({
      title: col.column_name,
      dataIndex: col.column_name,
      key: col.column_name,
      width: 250,
    })),
    {
      title: "Created at",
      dataIndex: "created_at",
      key: "created_at",
      width: 220,
    },
    {
      title: "Tools",
      key: "tools",
      width: 220,
      render: (_: any, record: Column) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="default"
            size="small"
            onClick={() => handleUpdate(record)}
          >
            Edit
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
              Delete
            </Button>
          </Popconfirm>
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
            Create
          </Button>
        </Flex>
        <Title level={3}>Data rows</Title>
        <Table
          rowKey="key"
          columns={tableColumns}
          dataSource={data}
          loading={loading}
        />
      </Modal>
      <Modal
        title={
          isModalOpen?.action === "create" ? "สร้าง Row data" : "แก้ไข Row data"
        }
        open={isModalOpen.isShow}
        onOk={handleSave}
        onCancel={closeModal}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          {dataColumns.map((col) => (
            <Form.Item
              key={col.column_name}
              label={col.column_name}
              name={col.column_name}
              rules={[{ required: false }]}
            >
              {renderInput(col)}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}
