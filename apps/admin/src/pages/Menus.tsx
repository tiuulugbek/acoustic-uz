import { useMemo, useState } from 'react';
import { Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ApiError,
  getMenu,
  updateMenu,
  type MenuDto,
  type MenuItemDto,
} from '../lib/api';

const menuOptions = [
  { label: 'Header menyu', value: 'header' },
  { label: 'Footer menyu', value: 'footer' },
];

function generateId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortMenuItems(items: MenuItemDto[]): MenuItemDto[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item) => ({
      ...item,
      children: item.children ? sortMenuItems(item.children) : undefined,
    }));
}

function normalizeMenuItems(entries: MenuItemDto[] | undefined): MenuItemDto[] | undefined {
  if (!entries || entries.length === 0) {
    return undefined;
  }

  return entries.map((entry, index) => {
    const normalizedChildren = normalizeMenuItems(entry.children);
    return {
      id: entry.id || generateId(),
      title_uz: entry.title_uz.trim(),
      title_ru: entry.title_ru.trim(),
      href: entry.href.trim(),
      order:
        typeof entry.order === 'number'
          ? entry.order
          : Number.isFinite(Number(entry.order))
            ? Number(entry.order)
            : (index + 1) * 10,
      ...(normalizedChildren && normalizedChildren.length > 0 ? { children: normalizedChildren } : {}),
    };
  });
}

export default function MenusPage() {
  const [selectedMenu, setSelectedMenu] = useState<string>('header');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null);
  const [form] = Form.useForm<MenuItemDto>();
  const queryClient = useQueryClient();

  const { data: menu, isLoading } = useQuery<MenuDto, ApiError>({
    queryKey: ['menu', selectedMenu],
    queryFn: () => getMenu(selectedMenu),
    staleTime: 5 * 60 * 1000,
  });

  const { mutateAsync: saveMenu, isPending: isSaving } = useMutation<MenuDto, ApiError, MenuItemDto[]>({
    mutationFn: (items) => updateMenu(selectedMenu, items),
    onSuccess: (updated) => {
      queryClient.setQueryData(['menu', selectedMenu], updated);
      message.success('Menyu saqlandi');
    },
    onError: (error) => {
      message.error(error.message || 'Saqlashda xatolik');
    },
  });

  const items = useMemo<MenuItemDto[]>(() => {
    if (menu?.items?.length) {
      return sortMenuItems(menu.items);
    }
    return [];
  }, [menu]);

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    const nextOrder = (items.reduce((max, item) => Math.max(max, item.order), 0) || 0) + 10;
    form.setFieldsValue({ order: nextOrder, children: [] } as Partial<MenuItemDto>);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItemDto) => {
    setEditingItem(item);
    form.setFieldsValue({
      title_uz: item.title_uz,
      title_ru: item.title_ru,
      href: item.href,
      order: item.order,
      children: item.children ? sortMenuItems(item.children) : [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (item: MenuItemDto) => {
    const nextItems = items.filter((existing) => existing.id !== item.id);
    await saveMenu(sortMenuItems(nextItems));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const normalizedChildren = normalizeMenuItems(values.children ?? []) ?? [];
      const prepared: MenuItemDto = {
        id: editingItem?.id ?? generateId(),
        title_uz: values.title_uz.trim(),
        title_ru: values.title_ru.trim(),
        href: values.href.trim(),
        order: Number(values.order),
        children: normalizedChildren.length ? normalizedChildren : undefined,
      };

      const baseItems = editingItem
        ? items.map((existing) => (existing.id === editingItem.id ? prepared : existing))
        : [...items, prepared];

      const sortedItems = sortMenuItems(baseItems);
      await saveMenu(sortedItems);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      // validation handled by form
    }
  };

  const columns: ColumnsType<MenuItemDto> = useMemo(
    () => [
      {
        title: 'Nom (uz)',
        dataIndex: 'title_uz',
        key: 'title_uz',
        render: (value: string, record) => (
          <div>
            <strong>{value}</strong>
            <div style={{ fontSize: 12, color: '#6b7280' }}>{record.title_ru}</div>
          </div>
        ),
      },
      {
        title: 'Havola',
        dataIndex: 'href',
        key: 'href',
        render: (value: string) =>
          value ? (
            <a href={value} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            '—'
          ),
      },
      {
        title: 'Ost menyular',
        key: 'children',
        render: (_, record) =>
          record.children?.length ? (
            <Space size={[4, 4]} wrap>
              {record.children.map((child) => (
                <Tag key={child.id}>{child.title_uz}</Tag>
              ))}
            </Space>
          ) : (
            '—'
          ),
      },
      {
        title: 'Tartib',
        dataIndex: 'order',
        key: 'order',
        width: 100,
      },
      {
        title: 'Amallar',
        key: 'actions',
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => openEditModal(record)}>
              Tahrirlash
            </Button>
            <Popconfirm
              title="Menyudan o‘chirish"
              description="Ushbu elementni o‘chirishni tasdiqlang"
              okText="Ha"
              cancelText="Yo‘q"
              onConfirm={() => handleDelete(record)}
            >
              <Button danger size="small" loading={isSaving}>
                O‘chirish
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [isSaving],
  );

  const childColumns: ColumnsType<MenuItemDto> = useMemo(
    () => [
      {
        title: 'Nom (uz)',
        dataIndex: 'title_uz',
        key: 'title_uz',
      },
      {
        title: 'Nom (ru)',
        dataIndex: 'title_ru',
        key: 'title_ru',
      },
      {
        title: 'Havola',
        dataIndex: 'href',
        key: 'href',
        render: (value: string) =>
          value ? (
            <a href={value} target="_blank" rel="noreferrer">
              {value}
            </a>
          ) : (
            '—'
          ),
      },
      {
        title: 'Tartib',
        dataIndex: 'order',
        key: 'order',
        width: 80,
      },
    ],
    [],
  );

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          options={menuOptions}
          value={selectedMenu}
          onChange={(value) => {
            setSelectedMenu(value);
            setIsModalOpen(false);
            form.resetFields();
          }}
        />
        <Button type="primary" onClick={openCreateModal}>
          Yangi element
        </Button>
      </Space>

      <Table<MenuItemDto>
        loading={isLoading || isSaving}
        dataSource={items}
        columns={columns}
        rowKey="id"
        pagination={false}
        expandable={{
          expandedRowRender: (record) =>
            record.children?.length ? (
              <Table<MenuItemDto>
                size="small"
                columns={childColumns}
                dataSource={sortMenuItems(record.children)}
                rowKey="id"
                pagination={false}
              />
            ) : (
              <div style={{ padding: '8px 0', color: '#6b7280' }}>Ost menyu mavjud emas</div>
            ),
          rowExpandable: (record) => Boolean(record.children?.length),
        }}
      />

      <Modal
        title={editingItem ? 'Menyu elementini tahrirlash' : 'Yangi menyu elementi'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Saqlash"
        cancelText="Bekor qilish"
        confirmLoading={isSaving}
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Nom (uz)"
            name="title_uz"
            rules={[{ required: true, message: 'Nom (uz) majburiy' }]}
          >
            <Input placeholder="Masalan, Xizmatlar" />
          </Form.Item>
          <Form.Item
            label="Nom (ru)"
            name="title_ru"
            rules={[{ required: true, message: 'Nom (ru) majburiy' }]}
          >
            <Input placeholder="Например, Услуги" />
          </Form.Item>
          <Form.Item
            label="Havola"
            name="href"
            rules={[{ required: true, message: 'Havola majburiy' }]}
          >
            <Input placeholder="/link yoki https://..." />
          </Form.Item>
          <Form.Item
            label="Tartib"
            name="order"
            initialValue={1}
            rules={[{ required: true, message: 'Tartib majburiy' }]}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.List name="children">
            {(fields, { add, remove }) => (
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <strong>Ost menyular</strong>
                  <Button
                    type="dashed"
                    onClick={() =>
                      add({
                        id: generateId(),
                        order: (fields.length + 1) * 10,
                      })
                    }
                  >
                    Ost menyu qo‘shish
                  </Button>
                </div>
                {fields.length === 0 ? (
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Hozircha ost menyu yo‘q.</div>
                ) : null}
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: 8,
                        padding: 12,
                        background: '#f9fafb',
                      }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Form.Item name={[field.name, 'id']} style={{ display: 'none' }}>
                          <Input />
                        </Form.Item>
                        <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                          <Form.Item
                            name={[field.name, 'title_uz']}
                            rules={[{ required: true, message: 'Nom (uz) majburiy' }]}
                            style={{ flex: 1 }}
                          >
                            <Input placeholder="Nom (uz)" />
                          </Form.Item>
                          <Form.Item
                            name={[field.name, 'title_ru']}
                            rules={[{ required: true, message: 'Nom (ru) majburiy' }]}
                            style={{ flex: 1 }}
                          >
                            <Input placeholder="Название (ru)" />
                          </Form.Item>
                        </div>
                        <Form.Item
                          name={[field.name, 'href']}
                          rules={[{ required: true, message: 'Havola majburiy' }]}
                          style={{ width: '100%' }}
                        >
                          <Input placeholder="/link yoki https://..." />
                        </Form.Item>
                        <Space align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Form.Item
                            label="Tartib"
                            name={[field.name, 'order']}
                            initialValue={(index + 1) * 10}
                            rules={[{ required: true, message: 'Tartib majburiy' }]}
                          >
                            <InputNumber />
                          </Form.Item>
                          <Button danger onClick={() => remove(field.name)}>
                            O‘chirish
                          </Button>
                        </Space>
                      </Space>
                    </div>
                  ))}
                </Space>
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

