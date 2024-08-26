import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; // 引入 useParams
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import { Box, TextField, Button } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { handleCreateJourney } from "../../firebase/firebaseService";
import { useState } from "react";
import styled from "styled-components";

const JourneyCardDrawer = ({ journeys, isLoading, error }) => {
  const navigate = useNavigate();
  // const { id: journeyId } = useParams();

  // const {
  //   data: journeys,
  //   isLoading,
  //   error,
  // } = useQuery({
  //   queryKey: ["journeys", journeyId],
  //   queryFn: () => fetchJourney(journeyId),
  //   onSuccess: (data) => console.log("Fetched journeys:", data),
  // });

  const groupedJourneys = journeys?.reduce((acc, journey) => {
    const date = new Date(journey.date).toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(journey);
    return acc;
  }, {});

  const [newJourney, setNewJourney] = useState({
    title: "",
    description: "",
  });

  const handleCreateJourneyClick = () => {
    if (newJourney.title && newJourney.description) {
      createMutation.mutate({
        title: newJourney.title,
        description: newJourney.description,
      });
    } else {
      alert("請填寫所有必要的字段");
    }
  };

  const createMutation = useMutation({
    mutationFn: ({ title, description }) =>
      handleCreateJourney(title, description),
    onSuccess: () => {
      alert("行程創建成功！");
      setNewJourney({ title: "", description: "" }); // 重置表單
    },
    onError: () => {
      alert("創建行程時出現錯誤");
    },
  });

  const handleInputChange = (e) => {
    setNewJourney({ ...newJourney, [e.target.name]: e.target.value });
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  return (
    <Drawer
      variant="permanent" // 設定為 permanent drawer
      anchor="right"
      PaperProps={{ style: { width: 300 } }}
    >
      <Box p={2}>
        <TypeWrapper>
          <Typography variant="h6">新增行程</Typography>
          <TextField
            label="行程名稱"
            name="title"
            value={newJourney.title}
            onChange={handleInputChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="行程描述"
            name="description"
            value={newJourney.description}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateJourneyClick}
            disabled={createMutation.isLoading}
            sx={{ mb: 2 }}
          >
            儲存此行程
          </Button>
        </TypeWrapper>
        <ContentWrapper>
          {isLoading ? (
            <Typography>加載中...</Typography>
          ) : error ? (
            <Typography>Oops: {error.message}</Typography>
          ) : groupedJourneys && Object.keys(groupedJourneys).length > 0 ? (
            Object.keys(groupedJourneys).map((date) => (
              <Box key={date} mb={2}>
                <Typography variant="h6">{date}</Typography>
                {groupedJourneys[date].map((journey) => (
                  <JourneyCard key={journey.id}>
                    {journey.photos && journey.photos.length > 0 && (
                      <Box mb={1}>
                        <JourneyImage
                          src={journey.photos[0]}
                          alt={journey.name || ""}
                        />
                      </Box>
                    )}
                    <Typography variant="body1">
                      {journey.name || ""}
                    </Typography>
                    <Typography variant="body2">
                      {journey.startTime || ""}
                    </Typography>
                  </JourneyCard>
                ))}
              </Box>
            ))
          ) : (
            <Typography>趕緊新增行程吧</Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoBack}
            sx={{ mt: 2 }}
          >
            返回行程總覽
          </Button>
        </ContentWrapper>
      </Box>
    </Drawer>
  );
};

JourneyCardDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

const TypeWrapper = styled.div`
  position: fixed;
  background: white;
  z-index: 1200;
  padding: 16px;
`;

const ContentWrapper = styled.div`
  margin-top: 330px;
  max-height: calc(100vh - 320px);
  padding-right: 16px;
`;

const JourneyCard = styled(Box)`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  margin-bottom: 16px;
`;

const JourneyImage = styled.img`
  width: 100%;
  height: auto;
  border-radius: 4px;
`;

export default JourneyCardDrawer;
