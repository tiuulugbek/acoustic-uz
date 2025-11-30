import React, { useState } from 'react';
import { Button, Modal, Form, Input, Space, message } from 'antd';
import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';

interface TooltipHelperProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  fieldName?: string; // Form field name to find textarea
}

/**
 * Helper component for adding tooltips to text
 * Allows users to easily insert tooltip shortcodes without manual typing
 */
export default function TooltipHelper({ value = '', onChange, placeholder, fieldName }: TooltipHelperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleInsertTooltip = () => {
    form.validateFields().then((values) => {
      const { keyword, content } = values;
      
      if (!keyword || !content) {
        message.warning('Iltimos, kalit so\'z va kontentni kiriting');
        return;
      }

      // Escape quotes in content
      const escapedContent = content.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      const escapedKeyword = keyword.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      
      // Create tooltip shortcode
      const tooltipCode = `[tooltips keyword="${escapedKeyword}" content="${escapedContent}"]`;
      
      // Find textarea - try multiple selectors
      let textarea: HTMLTextAreaElement | null = null;
      
      if (fieldName) {
        // Try to find by field name (Ant Design uses data attributes)
        const formItem = document.querySelector(`textarea[name="${fieldName}"], textarea[data-name="${fieldName}"]`) as HTMLTextAreaElement;
        if (formItem) {
          textarea = formItem;
        }
      }
      
      // Fallback: find active textarea (the one that was last focused)
      if (!textarea) {
        const activeElement = document.activeElement;
        if (activeElement && activeElement.tagName === 'TEXTAREA') {
          textarea = activeElement as HTMLTextAreaElement;
        }
      }
      
      // Fallback: find any visible textarea in the form
      if (!textarea) {
        const form = document.querySelector('.ant-form');
        if (form) {
          const textareas = form.querySelectorAll('textarea');
          // Find the one that's visible and not disabled
          for (const ta of Array.from(textareas)) {
            if (ta.offsetParent !== null && !ta.disabled) {
              textarea = ta;
              break;
            }
          }
        }
      }
      
      if (textarea) {
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const currentValue = textarea.value || value;
        const textBefore = currentValue.substring(0, start);
        const textAfter = currentValue.substring(end);
        const newValue = textBefore + tooltipCode + textAfter;
        
        // Update textarea value directly
        textarea.value = newValue;
        
        // Trigger onChange if provided
        onChange?.(newValue);
        
        // Set cursor position after inserted text
        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + tooltipCode.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
          
          // Trigger input event to notify React/Ant Design Form
          const inputEvent = new Event('input', { bubbles: true });
          textarea.dispatchEvent(inputEvent);
          
          // Also trigger change event for Ant Design
          const changeEvent = new Event('change', { bubbles: true });
          textarea.dispatchEvent(changeEvent);
        }, 0);
      } else {
        // Fallback: just append to value and call onChange
        onChange?.(value + tooltipCode);
      }
      
      form.resetFields();
      setIsModalOpen(false);
      message.success('Tooltip qo\'shildi');
    });
  };

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            size="small"
          >
            Tooltip qo'shish
          </Button>
          <span style={{ fontSize: '12px', color: '#999' }}>
            <QuestionCircleOutlined /> Format: [tooltips keyword="kalit so'z" content="tavsif"]
          </span>
        </Space>
      </Space>

      <Modal
        title="Tooltip qo'shish"
        open={isModalOpen}
        onOk={handleInsertTooltip}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Qo'shish"
        cancelText="Bekor qilish"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Kalit so'z (hover qilganda ko'rinadigan matn)"
            name="keyword"
            rules={[{ required: true, message: 'Kalit so\'zni kiriting' }]}
            extra="Masalan: Speech Rescue™, Frequency lowering, Feedback prevention"
          >
            <Input placeholder="Masalan: Speech Rescue™" />
          </Form.Item>
          <Form.Item
            label="Tavsif (tooltip ichidagi to'liq matn)"
            name="content"
            rules={[{ required: true, message: 'Tavsifni kiriting' }]}
            extra="Tooltip ichida ko'rsatiladigan to'liq tavsif"
          >
            <Input.TextArea
              rows={4}
              placeholder="Masalan: Bu texnologiya yuqori chastotali tovushlarni qayta tiklashga yordam beradi..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

