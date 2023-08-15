/*
 *
 * HomePage
 *
 */

import React, { useState, FC } from "react";
import { Plus } from "@strapi/icons";
import {
  Layout,
  BaseHeaderLayout,
  ContentLayout,
  EmptyStateLayout,
  Button,
} from "@strapi/design-system";
import ChatModal from "../../components/ChatModal/ChatModal";
// import { Illo } from "../../components/Illo/Illo";

const HomePage = () => {
  const [chats, setChats] = useState([]);
  const [showModal, setShowModal] = useState<boolean>(false);

  const handleAddNewChat = (name: string) => {
    console.log("handleAddNewChat");
  };

  const handleAddChat = () => {
    console.log("handleAddChat");
    setShowModal(true);
  };

  return (
    <Layout>
      <BaseHeaderLayout
        title="Telegram Bot Plugin"
        subtitle="Send message to Telegram."
        as="h2"
      />
      <ContentLayout>
        {chats.length === 0 ? (
          <EmptyStateLayout
            // icon={<Illo />}
            content="You don't have any chat yet..."
            action={
              <Button
                onClick={handleAddChat}
                variant="secondary"
                startIcon={<Plus />}
              >
                Add your first chat
              </Button>
            }
          >
            Add your first chat
          </EmptyStateLayout>
        ) : (
          <p>Chats is exist</p>
        )}
      </ContentLayout>
      {showModal && (
        <ChatModal setShowModal={setShowModal} addNewChat={handleAddNewChat} />
      )}
    </Layout>
  );
};

export default HomePage;
