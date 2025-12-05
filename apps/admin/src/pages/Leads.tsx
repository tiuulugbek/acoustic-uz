import { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Popconfirm,
  message,
  Select,
  Input,
} from 'antd';
import { DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getLeads,
  updateLead,
  deleteLead,
  LeadDto,
  UpdateLeadPayload,
  ApiError,
} from '../lib/api';

const statusOptions = [
  { label: 'Yangi', value: 'new' },
  { label: 'Ko\'rib chiqilmoqda', value: 'in_progress' },
  { label: 'Yakunlangan', value: 'completed' },
  { label: 'Bekor qilingan', value: 'cancelled' },
];

// Helper function to format source for display
const formatSource = (source: string | null | undefined): string => {
  if (!source) return 'Noma\'lum';
  
  // Format source for better readability
  if (source.startsWith('post-')) {
    return `📝 Maqola: ${source.replace('post-', '')}`;
  }
  if (source.startsWith('service-')) {
    return `🔧 Xizmat: ${source.replace('service-', '')}`;
  }
  if (source.startsWith('product-')) {
    return `🛍️ Mahsulot: ${source.replace('product-', '')}`;
  }
  if (source === 'contact-page') {
    return '📞 Contact sahifa';
  }
  if (source.startsWith('appointment_form')) {
    return '📋 Qabulga yozilish';
  }
  
  return source;
};

// Helper function to get source color
const getSourceColor = (source: string | null | undefined): string => {
  if (!source) return 'default';
  
  if (source.startsWith('post-')) return 'blue';
  if (source.startsWith('service-')) return 'green';
  if (source.startsWith('product-')) return 'orange';
  if (source === 'contact-page') return 'purple';
  if (source.startsWith('appointment_form')) return 'cyan';
  
  return 'default';
};

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [sourceFilter, setSourceFilter] = useState<string | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');

  const { data: leads, isLoading, error } = useQuery<LeadDto[], ApiError>({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  const { mutateAsync: updateLeadMutation, isPending: isUpdating } = useMutation<
    LeadDto,
    ApiError,
    { id: string; payload: UpdateLeadPayload }
  >({
    mutationFn: ({ id, payload }) => updateLead(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      message.success('Lead yangilandi');
    },
    onError: (error) => message.error(error.message || 'Yangilashda xatolik'),
  });

  const { mutateAsync: deleteLeadMutation, isPending: isDeleting } = useMutation<
    void,
    ApiError,
    string
  >({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      message.success('Lead o\'chirildi');
    },
    onError: (error) => message.error(error.message || 'O\'chirishda xatolik'),
  });

  // Filter leads
  const filteredLeads = leads?.filter((lead) => {
    if (statusFilter && lead.status !== statusFilter) return false;
    if (sourceFilter && lead.source !== sourceFilter) return false;
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      return (
        lead.name.toLowerCase().includes(searchLower) ||
        lead.phone.includes(searchText) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
        (lead.source && lead.source.toLowerCase().includes(searchLower)) ||
        (lead.message && lead.message.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  // Get unique sources for filter
  const uniqueSources = Array.from(
    new Set(leads?.map((lead) => lead.source).filter(Boolean) || [])
  );

  const columns: ColumnsType<LeadDto> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: string) => <span className="text-xs text-muted-foreground">{id.slice(0, 8)}...</span>,
    },
    {
      title: 'Ism',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Telefon',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone: string) => (
        <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
          {phone}
        </a>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string | null) =>
        email ? (
          <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
            {email}
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      title: 'Manba',
      dataIndex: 'source',
      key: 'source',
      width: 200,
      render: (source: string | null) => (
        <Tag color={getSourceColor(source)}>{formatSource(source)}</Tag>
      ),
    },
    {
      title: 'Xabar',
      dataIndex: 'message',
      key: 'message',
      width: 200,
      ellipsis: true,
      render: (message: string | null) =>
        message ? (
          <span title={message} className="text-sm">
            {message.length > 50 ? `${message.slice(0, 50)}...` : message}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      title: 'Holat',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status: string | null, record: LeadDto) => (
        <Select
          value={status || 'new'}
          onChange={(value) =>
            updateLeadMutation({ id: record.id, payload: { status: value } })
          }
          loading={isUpdating}
          style={{ width: '100%' }}
          size="small"
        >
          {statusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Yaratilgan',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => {
        const d = new Date(date);
        return (
          <span className="text-sm text-muted-foreground">
            {d.toLocaleDateString('uz-UZ', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
    {
      title: 'Amallar',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: unknown, record: LeadDto) => (
        <Space>
          <Popconfirm
            title="Lead'ni o'chirishni tasdiqlaysizmi?"
            onConfirm={() => deleteLeadMutation(record.id)}
            okText="Ha"
            cancelText="Yo'q"
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              size="small"
              loading={isDeleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) {
    return (
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          So'rovlar
        </h2>
        <p style={{ color: 'red' }}>Xatolik: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>So'rovlar</h2>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => queryClient.invalidateQueries({ queryKey: ['leads'] })}
          loading={isLoading}
        >
          Yangilash
        </Button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Input
          placeholder="Qidirish (ism, telefon, email, manba, xabar)"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '300px' }}
          allowClear
        />
        <Select
          placeholder="Holat bo'yicha filtrlash"
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          style={{ width: '200px' }}
        >
          {statusOptions.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
        <Select
          placeholder="Manba bo'yicha filtrlash"
          value={sourceFilter}
          onChange={setSourceFilter}
          allowClear
          style={{ width: '250px' }}
        >
          {uniqueSources.map((source) => (
            <Select.Option key={source} value={source}>
              {formatSource(source)}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredLeads}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Jami: ${total} ta lead`,
        }}
      />
    </div>
  );
}

