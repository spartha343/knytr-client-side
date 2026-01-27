import { Modal } from "antd";
import React, { ReactNode } from "react";

interface IModal {
  isOpen: boolean;
  closeModal: () => void;
  title: string | ReactNode;
  children: ReactNode; // ✅ This accepts ANY React content
  handleOk?: () => void;
  showCancelButton?: boolean;
  showOkButton?: boolean;
}

const KModal: React.FC<IModal> = ({
  isOpen,
  closeModal,
  title,
  children,
  handleOk,
  showCancelButton = true,
  showOkButton = true,
}) => {
  return (
    <Modal
      title={title}
      open={isOpen}
      onOk={handleOk}
      onCancel={closeModal}
      cancelButtonProps={{
        style: { display: showCancelButton ? "inline" : "none" },
      }}
      okButtonProps={{
        style: { display: showOkButton ? "inline" : "none" },
      }}
    >
      {children}
    </Modal>
  );
};

export default KModal;
