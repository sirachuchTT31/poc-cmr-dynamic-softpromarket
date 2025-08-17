"use client";

import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
} from "antd";
import Axios from "@/libs/axios";

const { Title } = Typography;

interface NeonDatabase {
  id: string;
  name: string;
  owner_name: string;
  created_at: string;
  key?: string | number;
}

export default function NeonPage() {
  const [data, setData] = useState<NeonDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState({
    isShow: false,
    action: "",
  });
  const [oldDatabaseName, setOldDatabaseName] = useState("");
  const [form] = Form.useForm();

  const normalize = (input: any): NeonDatabase[] => {
    if (!input) return [];
    const arr = Array.isArray(input) ? input : [input];
    return arr.map((item: any, index: number) => ({
      key: item.id || index,
      ...item,
    }));
  };

  const fetchDatabases = async () => {
    try {
      const res = await Axios.get("/database");
      console.log("response", res.data);

      if (res?.data?.success) {
        const databases = normalize(res.data.data.databases);
        setData(databases);
      }
    } catch (err) {
      console.error("Error fetching Neon data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
  }, []);

  const columns = [
    {
      title: "Database id",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Owner",
      dataIndex: "owner_name",
      key: "owner_name",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
    },
    {
      title: "Tools",
      key: "tools",
      render: (_: any, record: NeonDatabase) => (
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
              try {
                const res = await Axios.delete("/database", {
                  data: { name: record.name },
                });
                if (res.data.success) {
                  message.success("Delete Database success");
                  fetchDatabases();
                } else {
                  message.error("Delete Database fail");
                }
              } catch (err) {
                console.error(err);
              }
            }}
          >
            <Button size="small" danger>
              ลบ
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const openModal = () =>
    setIsModalOpen({
      action: "create",
      isShow: true,
    });
  const closeModal = () => {
    form.resetFields();
    setIsModalOpen({
      action: "",
      isShow: false,
    });
  };

  const handleSave = async () => {
    try {
      if (isModalOpen.action === "create") {
        const values = await form.validateFields();
        const res = await Axios.post("/database", values);
        if (res.data.success) {
          message.success("Create database success");
          fetchDatabases();
          closeModal();
        } else {
          message.error("Create database fail");
        }
      } else {
        const values = await form.validateFields();
        const payload = {
          ...values,
          oldName: oldDatabaseName,
        };
        const res = await Axios.patch(`/database`, payload);
        if (res.data.success) {
          message.success("Update database success");
          fetchDatabases();
          closeModal();
        } else {
          message.error("Update database fail");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = (record: { name: string }) => {
    setIsModalOpen({
      action: "update",
      isShow: true,
    });

    setOldDatabaseName(record?.name);

    form.setFieldsValue({
      name: record?.name,
    });
  };

  return (
    <Card
      style={{ margin: 24 }}
      extra={
        <Button type="primary" onClick={openModal}>
          สร้าง
        </Button>
      }
    >
      <Title level={3}>Database</Title>
      <Table
        rowKey="key"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        title="สร้าง Database"
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
            rules={[{ required: true, message: "กรุณากรอกชื่อ Database" }]}
          >
            <Input placeholder="ชื่อ Database" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
