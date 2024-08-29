import PropTypes from "prop-types";
import { useMutation } from "@tanstack/react-query";
import {
  handleCreateJourney,
  handleSaveJourney,
  fetchSingleJourney,
} from "../../firebase/firebaseService";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import styled from "styled-components";
import trash from "./img/trash-bin.png";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import "dayjs/locale/zh-tw";
import clock from "./img/clock.png";
import ConfirmDialog from "../../components/ConfirmDialog";
import AlertMessage from "../../components/AlertMessage";
import travelGif from "./img/travelImg.png";

dayjs.extend(duration);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale("zh-tw");

const JourneyList = ({
  journeyId,
  journeys,
  isLoading,
  error,
  onClickCard,
  sortedJourney,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [newJourney, setNewJourney] = useState({
    title: "",
    description: "",
  });
  const [open, setOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

  const handleOpenDialog = (journey) => {
    setSelectedJourney(journey);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedJourney) {
      onDelete(journeyId, selectedJourney.place_id);
      setOpen(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = dayjs(dateStr);
    const weekdayName = date.format("dddd");
    return `${date.format("MM/DD")} ${weekdayName}`;
  };

  const groupedJourneys = journeys
    ?.slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .reduce((acc, journey) => {
      const date = new Date(journey.date).toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(journey);
      return acc;
    }, {});

  if (groupedJourneys && Object.keys(groupedJourneys).length > 0) {
    Object.keys(groupedJourneys).forEach((date) => {
      groupedJourneys[date].sort((a, b) => {
        const timeA = dayjs(a.startTime, "HH:mm");
        const timeB = dayjs(b.startTime, "HH:mm");
        return timeA - timeB;
      });
    });
  }

  const calculateTimeDifference = (startTime1, startTime2) => {
    const time1 = dayjs(startTime1, "HH:mm");
    const time2 = dayjs(startTime2, "HH:mm");
    const diff = dayjs.duration(time2.diff(time1));
    const hours = diff.hours();
    const minutes = diff.minutes();

    if (minutes === 0) {
      return `${hours} 小時`;
    } else {
      return `${hours} 小時 ${minutes} 分鐘`;
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      journeyId
        ? handleSaveJourney(journeyId, title, description)
        : handleCreateJourney(title, description, navigate),
    onSuccess: () => {
      setAlertMessage(journeyId ? "行程已成功保存！" : "行程創建成功！");
      setNewJourney({ title: "", description: "" });
      handleWindowReload();
    },
    onError: () => {
      setAlertMessage("操作行程時出現錯誤");
    },
  });

  const handleCreateOrSaveJourneyClick = () => {
    if (newJourney.title && newJourney.description) {
      createMutation.mutate({
        title: newJourney.title,
        description: newJourney.description,
      });
    } else {
      alert("請填寫所有必要的字段");
    }
  };

  const handleInputChange = (e) => {
    setNewJourney({ ...newJourney, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (journeyId) {
      const fetchJourneyData = async () => {
        const data = await fetchSingleJourney(journeyId);
        setNewJourney({ title: data.title, description: data.description });
      };
      fetchJourneyData();
    }
  }, [journeyId]);

  const handleWindowReload = () => {
    window.location.reload();
  };
  const handleBackHome = () => {
    navigate("/home");
  };

  return (
    <ListWrapper>
      <TypeWrapper>
        <Title>行程總覽</Title>
        <JourneyTitleInput
          placeholder="行程名稱"
          name="title"
          value={newJourney.title}
          onChange={handleInputChange}
        />
        <JourneyDescriptionInput
          placeholder="行程描述"
          name="description"
          value={newJourney.description}
          onChange={handleInputChange}
        />
        <ActionButton
          onClick={handleCreateOrSaveJourneyClick}
          disabled={createMutation.isLoading}
        >
          {journeyId ? "儲存行程" : "建立行程"}
        </ActionButton>
      </TypeWrapper>
      <ContentWrapper>
        {isLoading ? (
          <Message>加載中...</Message>
        ) : error ? (
          <Message>Oops: {error.message}</Message>
        ) : groupedJourneys && Object.keys(groupedJourneys).length > 0 ? (
          Object.keys(groupedJourneys).map((date) => (
            <JourneyDateSection key={date}>
              <DateTitle>{formatDate(date)}</DateTitle>
              {groupedJourneys[date].map((journey, index, arr) => {
                const labelIndex = sortedJourney.findIndex(
                  (sorted) => sorted.id === journey.id
                );

                const nextJourney = arr[index + 1];
                const timeDifference = nextJourney
                  ? calculateTimeDifference(
                      journey.startTime,
                      nextJourney.startTime
                    )
                  : null;

                return (
                  <div key={journey.id}>
                    <JourneyCard onClick={() => onClickCard(journey)}>
                      <JourneyImageWrapper>
                        {labelIndex >= 0 && (
                          <JourneyLabel>{` ${labelIndex + 1}`}</JourneyLabel>
                        )}
                        {journey.photos && journey.photos.length > 0 && (
                          <JourneyImage
                            src={journey.photos[0]}
                            alt={journey.name || ""}
                          />
                        )}
                      </JourneyImageWrapper>
                      <JourneyContent>
                        <JourneyTitle>{journey.name || ""}</JourneyTitle>
                        <TimeContainer>
                          <ClockIcon src={clock} alt="Clock Icon" />
                          <JourneyTime>{journey.startTime || ""}</JourneyTime>
                        </TimeContainer>
                        <RemoveButton
                          onClick={(event) => {
                            event.stopPropagation();
                            handleOpenDialog(journey);
                          }}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.8 }}
                        >
                          <RemoveImg
                            src={trash}
                            alt="刪除"
                            initial={{ rotate: 0 }}
                            animate={{ rotate: [0, 20, -20, 0] }}
                            transition={{ duration: 0.5 }}
                          />
                        </RemoveButton>
                      </JourneyContent>
                    </JourneyCard>

                    {timeDifference && (
                      <TimeDifference>{timeDifference}</TimeDifference>
                    )}
                  </div>
                );
              })}
            </JourneyDateSection>
          ))
        ) : (
          <>
            <TravelImg src={travelGif} />
            <Message>趕緊新增行程吧</Message>
          </>
        )}
        <ActionButton onClick={handleBackHome}>返回行程總覽</ActionButton>
      </ContentWrapper>
      {alertMessage && (
        <AlertMessage message={alertMessage} severity="success" />
      )}
      <ConfirmDialog
        open={open}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmDelete}
        title="確認刪除"
        contentText={
          <span>
            您確定要刪除{" "}
            <span style={{ color: "#d02c2c" }}>{selectedJourney?.name}</span>{" "}
            嗎？此操作無法撤銷。
          </span>
        }
        confirmButtonText="確定刪除"
        cancelButtonText="取消"
        confirmButtonColor="secondary"
      />
    </ListWrapper>
  );
};

export default JourneyList;

JourneyList.propTypes = {
  journeys: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      photos: PropTypes.array,
      date: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
    })
  ),
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
  }),
  journeyId: PropTypes.string,
  onClickCard: PropTypes.func,
  sortedJourney: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
    })
  ),
  onDelete: PropTypes.func.isRequired,
};

const ListWrapper = styled.div`
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
`;

const TypeWrapper = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
`;

const JourneyTitleInput = styled.input`
  width: 100%;
  padding-top: 16px;
  margin-bottom: 16px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  outline: none;
`;

const JourneyDescriptionInput = styled.textarea`
  width: 100%;
  height: 100px;
  padding-top: 16px;
  margin-bottom: 16px;
  font-size: 1rem;
  border: none;
  border-radius: 4px;
  resize: none;
  outline: none;
`;

const ContentWrapper = styled.div`
  height: calc(100vh - 320px);
  margin-top: 16px;
  overflow-y: auto;
`;

const JourneyDateSection = styled.div`
  margin-bottom: 32px;
`;

const DateTitle = styled.h3`
  margin-bottom: 16px;
`;

const JourneyCard = styled.div`
  position: relative;
  border: none;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease-in-out;
  background-color: white;
  cursor: pointer;
`;

const JourneyImageWrapper = styled.div`
  width: 100%;
  max-height: 140px;
  overflow: hidden;
  border-radius: 4px;
  position: relative;
`;

const JourneyImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
  }
`;

const JourneyContent = styled.div`
  padding: 16px;
`;

const JourneyTitle = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
`;

const JourneyTime = styled.p`
  display: flex;
  width: 56px;
  margin-top: 24px;
  font-size: 0.875rem;
  font-weight: 700;
  border-radius: 4px;
  color: #57c2e9;
`;
const TimeContainer = styled.div`
  display: flex;
  position: relative;
`;

const ClockIcon = styled.img`
  position: relative;
  top: 22px;
  right: 4px;
  width: 24px;
  height: 24px;
`;
const TimeDifference = styled.p`
  padding: 8px 0 8px 16px;
  color: #555;
  margin: 0 0 8px 16px;
  border-left: 1px dashed #000;
`;

const ActionButton = styled.button`
  padding: 10px 16px;
  font-size: 1rem;
  color: white;
  background-color: #57c2e9;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  &:hover {
    background-color: rgb(0, 58, 94);
  }
`;
const TravelImg = styled.img`
  height: 280px;
  width: auto;
`;
const Message = styled.p`
  font-size: 1rem;
  color: #333;
`;

const JourneyLabel = styled.div`
  position: absolute;
  top: 16px;
  background-color: #d02c2c;
  color: white;
  padding: 4px 16px;
  font-size: 0.875rem;
  font-weight: bold;
  z-index: 2;
  clip-path: polygon(
    0 0,
    calc(100% - 10px) 0,
    100% 50%,
    calc(100% - 10px) 100%,
    0 100%
  );

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: -10px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 0 10px 10px;
    border-color: transparent transparent transparent #002138;
    z-index: 1;
  }
`;

const RemoveButton = styled(motion.button)`
  position: absolute;
  top: 208px;
  right: 8px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
`;

const RemoveImg = styled(motion.img)`
  &:hover {
    opacity: 0.7;
  }
`;
