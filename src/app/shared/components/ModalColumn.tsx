import React from "react";
import Axios from "@/libs/axios";
import {
  Button,
  Flex,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Table,
} from "antd";
import Title from "antd/es/typography/Title";
import { ColumnType } from "antd/es/table";
import { pgDataTypes, pgTypeMap } from "../constant/data-type";

export interface Column {
  column_name: string;
  data_type: string;
}

type ModalColumnProps = {
  open: boolean;
  onClose: (open: boolean) => void;
  table: string;
  database: string;
};

export default function ModalColumn({
  table,
  onClose,
  open,
  database,
}: ModalColumnProps) {
  const title = `Columns in table : ${table}`;
  const [data, setData] = React.useState<Column[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState({
    isShow: false,
    action: "",
  });
  const [form] = Form.useForm();
  const [oldColumn, setOldColumn] = React.useState("");
  const normalize = (input: any): Column[] => {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr.map((item: Column, index: number) => ({
      key: index,
      no: index + 1,
      column_name: item.column_name,
      data_type: pgTypeMap[item?.data_type],
    }));
  };

  const closeModal = () => {
    form.resetFields();
    setIsModalOpen({
      action: "",
      isShow: false,
    });
  };

  const fetchColumns = async () => {
    try {
      const res = await Axios.get(
        `/column?databaseName=${database}&tableName=${table}`
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

  const handleUpdate = (record: Column) => {
    setIsModalOpen({
      action: "update",
      isShow: true,
    });

    setOldColumn(record?.column_name);

    form.setFieldsValue({
      columnName: record?.column_name,
      columnType: record?.data_type,
    });
  };

  const handleDelete = async (record: Column) => {
    try {
      const res = await Axios.delete("/column", {
        data: {
          tableName: table,
          databaseName: database,
          columnName: record.column_name,
        },
      });
      if (res.data.success) {
        message.success("Delete column success");
        fetchColumns();
      } else {
        message.error("Delete column fail");
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
          tableName: table,
          columnName: values?.columnName,
          columnType: values?.columnType,
        };
        const res = await Axios.post("/column", payload);
        if (res.data.success) {
          message.success("Create column success");
          fetchColumns();
          closeModal();
        } else {
          message.error("Create column fail");
        }
      } else {
        const values = await form.validateFields();
        const payload = {
          newName: values?.name,
          oldName: oldColumn,
          databaseName: database,
          tableName: table,
          newType: values?.columnType,
        };
        const res = await Axios.put(`/column`, payload);
        if (res.data.success) {
          message.success("Update column success");
          fetchColumns();
          closeModal();
        } else {
          message.error("Update column fail");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    if (database && table) {
      fetchColumns();
    }
  }, [database, table]);

  const columns: ColumnType[] = [
    {
      title: "No",

      dataIndex: "no",
      key: "no",
      width: 80,
      align: "center",
    },
    {
      title: "Column name",
      dataIndex: "column_name",
      key: "column_name",
      width: 250,
    },
    {
      title: "Data type",
      dataIndex: "data_type",
      key: "data_type",
      width: 250,
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
        <Title level={3}>Column</Title>
        <Table
          rowKey="key"
          columns={columns}
          dataSource={data}
          loading={loading}
        />
      </Modal>

      <Modal
        title={
          isModalOpen?.action === "create" ? "สร้าง Column" : "แก้ไข Column"
        }
        open={isModalOpen.isShow}
        onOk={handleSave}
        onCancel={closeModal}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Column name"
            name="columnName"
            rules={[{ required: true, message: "กรุณากรอกชื่อ Column" }]}
          >
            <Input placeholder="ชื่อ Column" />
          </Form.Item>
          <Form.Item
            label="Data Type"
            name="columnType"
            rules={[{ required: true, message: "Please select column type" }]}
          >
            <Select placeholder="Select data type">
              {pgDataTypes.map((t) => (
                <Select.Option key={t.value} value={t.value}>
                  {t.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
