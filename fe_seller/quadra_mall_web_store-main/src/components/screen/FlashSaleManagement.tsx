import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  Button,
  Form,
  InputNumber,
  DatePicker,
  Select,
  Input,
  Typography,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  useGetFlashSales,
  useCreateFlashSale,
  useUpdateFlashSale,
  useDeleteFlashSale,
  useGetProductsForStore,
} from "@/hooks/useFlashSale";
import type {
  SellerFlashSaleProductDTO,
  CreateFlashSaleDTO,
  UpdateFlashSaleDTO,
  ProductSellerDTO,
} from "@/types/flashSale";

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Text } = Typography;

const FlashSaleManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [editingItem, setEditingItem] =
    useState<SellerFlashSaleProductDTO | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductSellerDTO | null>(null);
  const [productsList, setProductsList] = useState<ProductSellerDTO[]>([]);
  const [activeTab, setActiveTab] = useState("1");
  const [productPage, setProductPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const productPageSize = 10; // Fixed page size since no changer

  // Fetch flash sales (load many at once, no pagination for simplicity)
  const { data: flashSales = [], isLoading: isLoadingFlashSales } =
    useGetFlashSales(0, 100);

  // Fetch products for store
  const { data: productsResponse } = useGetProductsForStore(
    productPage,
    productPageSize,
    searchQuery
  );
  const products = productsResponse?.data || [];
  const productTotal = productsResponse?.total || 0;

  // Accumulate products for Select options
  useEffect(() => {
    setProductsList((prev) =>
      productPage === 0 ? products : [...prev, ...products]
    );
  }, [products, productPage]);

  // Mutations
  const { mutate: createMutate } = useCreateFlashSale();
  const { mutate: updateMutate } = useUpdateFlashSale();
  const { mutate: deleteMutate } = useDeleteFlashSale();

  const onSearch = (value: string) => {
    setSearchQuery(value);
    setProductPage(0);
  };

  const handleProductSelect = (value: number) => {
    const selected = productsList.find((p) => p.id === value);
    if (selected) {
      setSelectedProduct(selected);
      form.setFieldsValue({ productId: value });
    }
  };

  const showForm = (item?: SellerFlashSaleProductDTO) => {
    setEditingItem(item || null);
    if (item) {
      form.setFieldsValue({
        productId: item.productId,
        percentageDiscount: item.percentageDiscount,
        quantity: item.quantity,
        timeRange: [dayjs(item.startTime), dayjs(item.endTime)],
      });
      setSelectedProduct({
        id: item.productId,
        name: item.productName,
        minPrice: item.minPrice,
        maxPrice: item.maxPrice,
        stock: item.stock,
      });
    } else {
      form.resetFields();
      setSelectedProduct(null);
    }
    setActiveTab("2");
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const [startTime, endTime] = values.timeRange;
      const payload = {
        percentageDiscount: values.percentageDiscount,
        quantity: values.quantity,
        startTime: startTime.format("YYYY-MM-DDTHH:mm:ss"),
        endTime: endTime.format("YYYY-MM-DDTHH:mm:ss"),
      };

      const onSuccessCallback = () => setActiveTab("1");

      if (editingItem) {
        updateMutate(
          { id: editingItem.id, data: payload as UpdateFlashSaleDTO },
          { onSuccess: onSuccessCallback }
        );
      } else {
        const createPayload = {
          ...payload,
          productId: values.productId,
        } as CreateFlashSaleDTO;
        createMutate(createPayload, { onSuccess: onSuccessCallback });
      }
    } catch (error) {
      // Form validation will handle
    }
  };

  const handleDelete = (id: number) => {
    deleteMutate(id);
  };

  const handleCancel = () => {
    form.resetFields();
    setSelectedProduct(null);
  };

  const columns = [
    { title: "Tên Sản Phẩm", dataIndex: "productName", key: "productName" },
    {
      title: "Giá Gốc (min - max)",
      key: "priceRange",
      render: (_: any, record: SellerFlashSaleProductDTO) =>
        `${record.minPrice} - ${record.maxPrice}`,
    },
    {
      title: "Phần Trăm Giảm",
      dataIndex: "percentageDiscount",
      key: "percentageDiscount",
      render: (text: number) => `${text}%`,
    },
    { title: "Tồn kho", dataIndex: "stock", key: "stock" },
    { title: "Số Lượng", dataIndex: "quantity", key: "quantity" },
    {
      title: "Thời Gian Bắt Đầu",
      dataIndex: "startTime",
      key: "startTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Thời Gian Kết Thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (text: string) => dayjs(text).format("YYYY-MM-DD HH:mm"),
    },
    {
      title: "Hành Động",
      key: "actions",
      render: (_: any, record: SellerFlashSaleProductDTO) => (
        <>
          <Button
            icon={<EditOutlined />}
            onClick={() => showForm(record)}
            style={{ marginRight: "8px" }}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          />
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#fff", minHeight: "100vh" }}>
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Danh Sách Flash Sale" key="1">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showForm()}
            style={{ marginBottom: 16 }}
          >
            Tạo Flash Sale
          </Button>
          <Table
            columns={columns}
            dataSource={flashSales}
            rowKey="id"
            pagination={false}
            loading={isLoadingFlashSales}
          />
        </TabPane>
        <TabPane tab="Tạo/Sửa Flash Sale" key="2">
          <Form form={form} layout="vertical">
            {!editingItem && (
              <Input.Search
                placeholder="Tìm kiếm sản phẩm..."
                onSearch={onSearch}
                enterButton
                style={{ marginBottom: 16 }}
              />
            )}
            {!editingItem && (
              <Form.Item
                name="productId"
                label="Sản Phẩm"
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
              >
                <Select
                  placeholder="Chọn sản phẩm"
                  showSearch
                  filterOption={false}
                  onSearch={(value) => onSearch(value)}
                  options={productsList.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  onChange={handleProductSelect}
                  notFoundContent={
                    productsList.length === 0 ? (
                      <Text type="secondary">Tìm kiếm để tải sản phẩm</Text>
                    ) : null
                  }
                />
              </Form.Item>
            )}

            {editingItem && (
                <Input disabled value={editingItem.productName} />
            )}
            {!editingItem && (
              <Button
                onClick={() => setProductPage((prev) => prev + 1)}
                disabled={productsList.length >= productTotal}
                style={{ marginBottom: "16px" }}
                block
              >
                Load more
              </Button>
            )}
            {selectedProduct && (
              <>
                <Form.Item label="Giá Gốc (min - max)">
                  <Input
                    value={`${selectedProduct.minPrice} - ${selectedProduct.maxPrice}`}
                    disabled
                  />
                </Form.Item>
                <Form.Item label="Tồn kho">
                  <InputNumber
                    value={selectedProduct.stock}
                    disabled
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </>
            )}
            <Form.Item
              name="percentageDiscount"
              label="Phần trăm giảm giá"
              rules={[
                { required: true, message: "Vui lòng nhập phần trăm giảm giá" },
                { type: "number", min: 1, message: "Phần trăm phải lớn hơn 0" },
                {
                  type: "number",
                  max: 99,
                  message: "Phần trăm phải nhỏ hơn 100",
                },
              ]}
            >
              <InputNumber min={1} max={99} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Số Lượng"
              rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label="Khoảng Thời Gian"
              rules={[
                { required: true, message: "Vui lòng chọn khoảng thời gian" },
              ]}
            >
              <RangePicker showTime style={{ width: "100%" }} />
            </Form.Item>
            <div style={{ marginTop: 16 }}>
              <Button type="primary" onClick={handleOk}>
                {editingItem ? "Cập Nhật" : "Tạo Mới"}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </Form>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default FlashSaleManagement;
