import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { styled } from "styled-components";
import whiteCloseImg from "./img/close-white.png";
import whiteLocationImg from "./img/location-white.png";
import Grid from "@mui/material/Grid";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import Rating from "@mui/material/Rating";
import Switch from "@mui/material/Switch";
import { initializeStreetView } from "../../utils/mapApi";
import useConfirmDialog from "../../Hooks/useConfirmDialog";

const StreetViewModal = ({
  placeDetails,
  onClose,
  modalType,
  onDelete,
  onUpdate,
  onChangeDate,
  onChangeTime,
  tripDate,
  tripStartTime,
  onCreate,
  journeyId,
  toggleView,
  isStreetView,
}) => {
  const streetViewRef = useRef(null);
  const { ConfirmDialogComponent, openDialog } = useConfirmDialog();
  useEffect(() => {
    if (placeDetails && streetViewRef.current) {
      initializeStreetView(streetViewRef.current, placeDetails);
    }
  }, [placeDetails]);

  const openDeleteDialog = () => {
    if (!placeDetails || !journeyId) {
      return;
    }
    openDialog(placeDetails.name, () => {
      onDelete(journeyId);
    });
  };

  if (!placeDetails) return null;

  return (
    <ModalOverlay>
      <ModalContainer>
        <StreetViewContainer ref={streetViewRef}> </StreetViewContainer>
        <InfoContainer>
          <CloseIcon src={whiteCloseImg} onClick={onClose} />
          <ModalHeader>
            <AttractionName>{placeDetails.name}</AttractionName>
          </ModalHeader>
          <ModalMain>
            <RatingWrapper>
              <Rating
                name="read-only"
                value={placeDetails.rating || 0}
                readOnly
                precision={0.1}
              />
              <RatingText>
                {placeDetails.rating ? `${placeDetails.rating} 分` : "無評價"}
              </RatingText>
            </RatingWrapper>
            <AddressWrapper>
              <AddressIcon src={whiteLocationImg} />
              <AddressText>{placeDetails.formatted_address}</AddressText>
            </AddressWrapper>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid
                container
                columns={{ xs: 1, lg: 2 }}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item>
                  <StyledDateCalendar
                    value={tripDate}
                    onChange={onChangeDate}
                  />
                </Grid>
                <Grid item>
                  <StyledTimePicker
                    value={tripStartTime}
                    onChange={onChangeTime}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </ModalMain>
          <ModalFooter>
            <SwitchContainer>
              <StyledSwitch checked={isStreetView} onChange={toggleView} />
            </SwitchContainer>
            {modalType === "create" ? (
              <ButtonWrapper>
                <ModalButton onClick={onCreate}>新增至行程</ModalButton>
              </ButtonWrapper>
            ) : (
              <ButtonWrapper>
                <ModalButton onClick={onUpdate}>更新行程時間</ModalButton>
                <ModalButton onClick={openDeleteDialog}>刪除此地標</ModalButton>
              </ButtonWrapper>
            )}
            <Message>街景模式僅在桌機版可使用</Message>
          </ModalFooter>
        </InfoContainer>
      </ModalContainer>
      {ConfirmDialogComponent}
    </ModalOverlay>
  );
};

StreetViewModal.propTypes = {
  journeyId: PropTypes.string.isRequired,
  modalType: PropTypes.string.isRequired,
  placeDetails: PropTypes.shape({
    name: PropTypes.string.isRequired,
    formatted_address: PropTypes.string.isRequired,
    rating: PropTypes.number,
    geometry: PropTypes.shape({
      location: PropTypes.shape({
        lat: PropTypes.func.isRequired,
        lng: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    place_id: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onDelete: PropTypes.func,
  onUpdate: PropTypes.func,
  onCreate: PropTypes.func,
  onChangeDate: PropTypes.func,
  onChangeTime: PropTypes.func,
  tripDate: PropTypes.instanceOf(dayjs),
  tripStartTime: PropTypes.instanceOf(dayjs),
  toggleView: PropTypes.func.isRequired,
  isStreetView: PropTypes.bool.isRequired,
};

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const ModalContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: end;
  background-color: white;
  padding: 0;
  border-radius: 8px;
  width: 819px;
  height: 661px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    width: 100%;
    height: 100vh;
    border-radius: 0;
    padding: 0;
    display: block;
  }
`;

const StreetViewContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  border-radius: 8px;
`;

const InfoContainer = styled.div`
  position: relative;
  width: 375px;
  padding: 10px 20px 25px 25px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  z-index: 2;
`;

const CloseIcon = styled.img`
  position: absolute;
  top: 15px;
  right: 18px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  @media (max-width: 768px) {
    z-index: 2;
  }
`;

const StyledDateCalendar = styled(DateCalendar)`
  position: relative;

  width: 300px !important;
  height: 300px !important;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  .MuiTypography-root {
    color: #fff;
  }

  .MuiPickersCalendarHeader-label,
  .MuiPickersCalendarHeader-switchViewButton,
  .MuiIconButton-root {
    color: #fff;
  }

  .MuiPickersDay-root {
    color: #fff;
  }

  .Mui-selected {
    background-color: rgba(255, 255, 255, 0.3) !important;
  }
`;

const StyledTimePicker = styled(TimePicker)`
  position: relative;
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 8px;
  margin-top: 16px;

  padding: 8px;
  right: 35px;
  top: 10px;

  .MuiTypography-root {
    color: #fff;
  }

  .MuiOutlinedInput-root {
    color: #fff;
  }

  .MuiInputAdornment-root {
    color: #fff;
  }
`;

const AttractionName = styled.h1`
  position: relative;
  width: 250px;
  color: white;
  font-size: 24px;
  font-weight: 700;
`;

const ModalHeader = styled.div`
  width: 100%;
`;

const ModalMain = styled.div`
  width: 100%;
  margin-bottom: 70px;
`;

const RatingWrapper = styled.div`
  display: flex;
  margin-top: 10px;
`;

const RatingText = styled.p`
  color: white;
  font-size: 16px;
  font-weight: 400;
  margin-left: 10px;
`;

const AddressWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0px 10px 0px;
`;

const AddressIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const AddressText = styled.h3`
  color: white;
  font-size: 16px;
  font-weight: 400;
  padding-left: 10px;
`;

const ModalFooter = styled.div`
  width: 100%;
  position: relative;
  bottom: 10px;
  right: -10px;
  display: flex;
  justify-content: end;
`;

const SwitchContainer = styled.div`
  position: relative;
  right: 36px;
  top: 8px;
  width: 30px;
  display: flex;
  align-items: center;
`;

const StyledSwitch = styled(Switch)`
  margin: 0 10px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  background-color: #57c2e9;
  position: relative;
  right: 10px;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 10px 0 0 10px;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
`;
const Message = styled.span`
  position: absolute;
  right: 11px;
  top: 59px;
  font-size: 10px;
`;

export default StreetViewModal;
