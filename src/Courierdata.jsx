import React, { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from 'react-secure-storage';
import { useNavigate } from 'react-router';
import Shubkeylogo from './Assets/Shubhkeylogo';
import Loading from './Assets/Loading';
import useAuth from './useAuth';

const Courierdata = () => {
  useAuth();

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [jobsdata, setjobsdata] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();

  const sessionStorageRemoveData = () => {
    sessionStorage.removeItem('jobCourierData')
  }

  sessionStorageRemoveData();

  const handlePickup = async (jobsId) => {
    const token = JSON.parse(secureLocalStorage.getItem('token'));
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const response = await axios.get(`http://192.168.0.153:7000/api/JobsMain/data/${jobsId}`, {
        headers: headers
      });
      const response2 = await axios.get(`http://192.168.0.153:7000/api/Addresses/LatLong?PickupAddrLine1=${response.data.addrLine1}&PickupAddrLine2=${response.data.addrLine2}&PickupAddrLine3=${response.data.addrLine3}&PickupCity=${response.data.city}&PickupStateAbbr=${response.data.stateAbbr}&PickupZipCode=${response.data.zipCode}&PickupCountryId=${response.data.countryId}&DeliveryAddrLine1=${response.data.deliveryAddrLine1}&DeliveryAddrLine2=${response.data.deliveryAddrLine2}&DeliveryAddrLine3=${response.data.deliveryAddrLine3}&DeliveryCity=${response.data.deliveryCity}&DeliveryStateAbbr=${response.data.deliveryStateAbbr}&DeliveryZipCode=${response.data.deliveryZipCode}&DeliveryCountryId=${response.data.deliveryCountryId}`, {

        headers: headers
      });

      sessionStorage.setItem('jobCourierData', JSON.stringify(response2.data))
      if (response2) {
        navigate('/map', { state: response.data })
      }
      setLoading(false);
    }
    catch (error) {
      setLoading(false);
      if (error.response) {
        toast.error(error.response.data.message);
      } else if (error.request) {
        toast.error('Server is not responding. Please try again later.');
      } else {
        toast.error('Failed to connect to the server. Please check your network connection.');
      }
    }
  };

  const handledata = async (page, formData) => {
    const token = JSON.parse(secureLocalStorage.getItem('token'));
    const courierId = JSON.parse(secureLocalStorage.getItem('userCourier'));
    try {
      setLoading(true);
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      let url = `http://192.168.0.153:7000/api/TaskLogs/GetJobsByCourierId/${courierId}?isVerify=N&pageNumber=${page}&pageSize=${itemsPerPage}`;
      if (formData && Object.keys(formData).length !== 0) {
        const queryParams = new URLSearchParams(formData).toString();
        if (queryParams) {
          url += `/${queryParams}`;
        }
      }
      const response = await axios.get(url, { headers });
      setjobsdata(response.data.taskLogs);
      setLoading(false);
    } catch (error) {
      if (error.request) {
        toast.error('Server is not responding. Please try again later.');
      } else {

        toast.error('Failed to connect to the server. Please check your network connection.');
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    handledata(currentPage);

  }, [currentPage]);

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <Shubkeylogo />
      <div className='container mt-5'>
        <div className="container-fluid p-0">
          <div className="card mt-2 w-100">
            <h5 style={{ textAlign: 'center', marginTop: '20px' }}>Courier TaskLogs</h5>
            <div className="mt-2">
              <table className="table table-responsive w-100">
                <thead>
                  <tr>
                    <th scope="col">Jobs Id</th>
                    <th scope="col">Pickup Address</th>
                    <th scope="col">Pickup Zipcode</th>
                    <th scope="col">Delivery Address</th>
                    <th scope="col">Delivery ZipCode</th>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Action</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobsdata && jobsdata.map((jobs, index) => (
                    <tr key={index}>
                      <td>{jobs.jobsId}</td>
                      <td>{jobs.pickupAddrLine1}</td>
                      <td>{jobs.pickupZipCode}</td>
                      <td>{jobs.deliveryAddrLine1}</td>
                      <td>{jobs.deliveryZipCode}</td>
                      <td>{jobs.customerName}</td>
                      <td>
                        <button
                          type="button"
                          className='btn btn-primary'
                          onClick={() => handlePickup(jobs.jobsId)}>
                          Pickup
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Courierdata;
