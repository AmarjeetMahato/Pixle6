"use client"

import { FaArrowDown, FaArrowUp, FaFilter } from "react-icons/fa";
import { IoIosArrowDown, IoMdMenu } from "react-icons/io";
import { User } from "@/types";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";

// Helper function to access nested properties
const getNestedProperty = (obj: any, key: string) => {
  return key.split('.').reduce((o, k) => (o && o[k] !== 'undefined') ? o[k] : undefined, obj);
};

export default function Home() {
  const [data, setData] = useState<Array<User>>([]);
  const [filteredData, setFilteredData] = useState<Array<User>>([]);
  const [cityArrow, setCityArrow] = useState<boolean>(false);
  const [genArrow, setGenArrow] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof User | ''; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });

  const API_URL = `https://dummyjson.com/users`;

  useEffect(() => {
    fetchData(page);
  }, [page]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  const fetchData = async (page: number) => {
    try {
      const res = await axios.get(`${API_URL}?page=${page}&limit=10`);
      const newUsers = res.data.users;
      
      setData((prevData) => [...prevData, ...newUsers]);
      // Apply sorting to the newly fetched data
      const sortedData = _.orderBy([...data, ...newUsers], [sortConfig.key], [sortConfig.direction]);
      setFilteredData(sortedData.slice(0, page * 10));
      
      if (newUsers.length < 10) {
        setHasMore(false); // No more data available
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  

  const sortData = (key: keyof User) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Sort the complete dataset
    const sortedData = _.orderBy(data, [key], [direction]);
    setFilteredData(sortedData.slice(0, page * 10)); // Apply pagination on the sorted data
    
    // Reset page number and check if more data is available
    setPage(1);
    setHasMore(sortedData.length > 10);
  };
  

  const filterData = (key: string, value: string) => {
    // If the value is empty, reset the filtered data to the original data
    if (!value) {
      setFilteredData(data);
      return;
    }
  
    // Filter the data based on the provided key and value
    const filtered = data.filter((user) => {
      // Get the property value from the user object based on the key
      const propertyValue = getNestedProperty(user, key);
      // Check if the property value exists and matches the filter value (case insensitive)
      return propertyValue && propertyValue.toLowerCase() === value.toLowerCase();
    });
  
    // Update the filteredData state with the filtered results
    setFilteredData(filtered);
  };
  

  return (
    <>
      {/* Logo and Menu Icon */}
      <div className="container mx-auto p-4 flex items-center justify-between">
        <h1 className="text-[30px]">Pixel<span className="text-red-500">6</span></h1>
        <IoMdMenu size={24} className="text-red-500" />
      </div>

      <Separator />

      {/* Filter Section */}
      <div className="container mx-auto p-4 flex items-center justify-between">
        <h1 className="text-[35px] font-semibold">Employees</h1>
        <div className="flex items-center gap-4">
          <FaFilter size={22} className="text-red-500" />

          <div className="relative flex-1">
            <select
              onClick={() => setCityArrow(!cityArrow)}
              className="block w-full border hover:border-red-500 border-gray-400 p-2 rounded-md pl-8 pr-8 cursor-pointer appearance-none text-base bg-white"
              onChange={(e) => filterData('address.city', e.target.value)}
            >
              <option value="">City</option>
              {data && data.map((item, index) => (
                <option key={index} value={item.address.city}>{item.address.city}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <IoIosArrowDown className={`${cityArrow ? "rotate-180" : ""} w-5 h-5 text-red-500`} />
            </div>
          </div>

          <div className="relative flex-1">
            <select
              onClick={() => setGenArrow(!genArrow)}
              className="block w-full border border-gray-400 hover:border-red-500 p-2 rounded-md pl-8 pr-8 cursor-pointer appearance-none text-base bg-white"
              onChange={(e) => filterData('gender', e.target.value)}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <IoIosArrowDown className={`${genArrow ? "rotate-180" : ""} w-5 h-5 text-red-500`} />
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <main className="container mx-auto p-4">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <InfiniteScroll
           dataLength={filteredData.length}
           next={() => {
             setPage((prevPage) => {
               const nextPage = prevPage + 1;
               fetchData(nextPage);
               return nextPage;
             });
           }}
           hasMore={hasMore}
           loader={<h4>Loading...</h4>}
           endMessage={<p>No more users to load</p>}
          >
            <table className="min-w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="py-3 px-6 text-left flex items-center">
                    ID
                    <span className="flex items-center ml-2 cursor-pointer" onClick={() => sortData('id')}>
                      {/* Both Arrow key color should be changed according ot the direction that is asc or desc  */}
                    <FaArrowDown className={`${sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'text-red-500' : ''}`} />
                    <FaArrowUp className={`${sortConfig.key === 'id' && sortConfig.direction === 'desc' ? 'text-red-500' : ''}`} />

                    </span>
                  </th>
                  <th className="py-3 px-6 text-left">Image</th>
                  <th className="py-3 px-6 text-left flex items-center">
                    Full Name
                    <span className="flex items-center ml-2 cursor-pointer" onClick={() => sortData('firstName')}>
                        {/* Both Arrow key color should be changed according ot the direction that is asc or desc  */}
                    <FaArrowDown className={`${sortConfig.key === 'id' && sortConfig.direction === 'asc' ? 'text-red-500' : ''}`} />
                   <FaArrowUp className={`${sortConfig.key === 'id' && sortConfig.direction === 'desc' ? 'text-red-500' : ''}`} />

                    </span>
                  </th>
                  <th className="py-3 px-6 text-left">Demography</th>
                  <th className="py-3 px-6 text-left">Designation</th>
                  <th className="py-3 px-6 text-left">Location</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((user, index) => (
                  <tr key={index} className="bg-gray-100 border-b border-gray-200">
                    <td className="py-4 px-6">{(user.id).toString().padStart(2, '0')}</td>
                    <td className="py-4 px-6">
                      <Image src={user.image} alt="Profile Image" height={30} width={30} className="object-cover rounded-full" />
                    </td>
                    <td className="py-4 px-6">{user.firstName} {user.lastName}</td>
                    <td className="py-4 px-6">{user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}, {user.age}</td>
                    <td className="py-4 px-6">{user.company.department}</td>
                    <td className="py-4 px-6">{user.address.state}, {user.address.country === "United States" ? "USA" : user.address.country}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </main>
    </>
  );
}
