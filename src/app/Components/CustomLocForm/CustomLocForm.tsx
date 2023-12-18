"use client";

import { UserSessionInfo, GoogleMapPoint } from "@/app/Interfaces/interfaces";
import { postNewUserLocation } from "@/app/Util/APICalls";
import { Dispatch, useState } from "react";

interface Props {
  newUserLocCoords: {
    lat: string;
    lng: string;
  };
  setNewUserLocCoords: Dispatch<
    React.SetStateAction<{ lat: string; lng: string } | null>
  >;
  newUserLocMarker: google.maps.Marker | null;
  setNewUserLocMarker: Dispatch<
    React.SetStateAction<google.maps.Marker | null>
  >;
  userInfo: UserSessionInfo;
  setMapLocations: Dispatch<React.SetStateAction<GoogleMapPoint[] | []>>;
}

export default function CustomLocForm({
  newUserLocCoords,
  setNewUserLocCoords,
  newUserLocMarker,
  setNewUserLocMarker,
  userInfo,
  setMapLocations,
}: Props) {
  const [locName, setLocName] = useState("");
  const [locType, setLocType] = useState("Select Sport");
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmitError = (errMsg: string) => {
    setSubmitMessage(errMsg);
    setTimeout(() => {
      setSubmitMessage("");
    }, 2500);
  };

  const resetNewUserCoordsAndMarker = () => {
    if (newUserLocMarker && newUserLocCoords) {
      newUserLocMarker.setMap(null);
      setNewUserLocCoords(null);
      setNewUserLocMarker(null);
    }
  };

  const handleSubmit = async () => {
    if (!locName) {
      handleSubmitError("Please enter a name for your new location.");
      return;
    } else if (locName.length > 50) {
      handleSubmitError("Location names cannot be longer than 50 characters.");
      return;
    } else if (locType === "Select Sport") {
      handleSubmitError("Please choose a sport for this location.");
      return;
    } else if (locName.toLowerCase().includes("script")) {
      handleSubmitError("NO XSS");
      return;
    }
    const newUserLoc = {
      name: locName,
      latitude: newUserLocCoords.lat,
      longitude: newUserLocCoords.lng,
      user_id: userInfo.id,
      poi_type: locType,
    };
    postNewUserLocation(newUserLoc)
      .then((response: string) => {
        if (response.startsWith("Success")) {
          setSubmitMessage("New location saved!");
          if (newUserLocMarker) {
            newUserLocMarker.setMap(null);
            setNewUserLocMarker(null);
          }
          let newMapPoint: GoogleMapPoint = {
            name: locName,
            coords: {
              lat: +newUserLocCoords.lat,
              lng: +newUserLocCoords.lng,
            },
          };
          setMapLocations((prevMapPoints) => [...prevMapPoints, newMapPoint]);
          setTimeout(() => {
            setLocName("");
            setLocType("Select Sport");
            setSubmitMessage("");
            setNewUserLocCoords(null);
          }, 1500);
        }
      })
      .catch((error: Error) => {
        setSubmitMessage("Error saving location. Please try again.");
        console.error(error);
        setTimeout(() => {
          setSubmitMessage("");
        }, 2000);
      });
  };

  return (
    <form className="custom-loc-form">
      <div className="custom-loc-form-coords">
        {submitMessage ? (
          <p id="submitMessage">{submitMessage}</p>
        ) : (
          <>
            <p>Lat: {newUserLocCoords.lat}</p>
            <p>Long: {newUserLocCoords.lng}</p>
          </>
        )}
      </div>
      <input
        id="customLocNameInput"
        className="custom-loc-form-input"
        type="text"
        placeholder="Name your new location"
        aria-label="Enter the name of your new custom location"
        value={locName}
        onChange={(e) => setLocName(e.target.value)}
      />
      {/* REFACTOR - Use TypeSelect? */}
      <select
        className="custom-loc-form-input"
        value={locType}
        onChange={(e) => setLocType(e.target.value)}
        aria-label="Select sport type for your new custom location"
      >
        <option disabled value="Select Sport">
          Select Sport
        </option>
        <option value="climb">Climbing</option>
        <option value="mtb">Mountain Biking</option>
        <option value="ski">Skiing / Snowboarding</option>
      </select>
      <div className="custom-loc-btn-div">
        <button
          className="custom-loc-form-input"
          onClick={(e) => {
            e.preventDefault();
            resetNewUserCoordsAndMarker();
          }}
        >
          Delete
        </button>
        <button
          className="custom-loc-form-input"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          Save
        </button>
      </div>
    </form>
  );
}
