"use client"

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InfiniteScroll from 'react-infinite-scroll-component';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('id');
  const [filterGender, setFilterGender] = useState('');
  const [filterCountry, setFilterCountry] = useState('');

  const fetchUsers = async () => {
    const limit = 10;
    const skip = (page - 1) * limit;
    let url = `https://dummyjson.com/users?limit=${limit}&skip=${skip}&sort=${sortBy}`;

    if (filterGender) {
      url += `&gender=${filterGender}`;
    }

    if (filterCountry) {
      url += `&country=${filterCountry}`;
    }

    const response = await axios.get(url);
    const newUsers = response.data.users;

    if (newUsers.length === 0) {
      setHasMore(false);
    }

    setUsers([...users, ...newUsers]);
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortBy, filterGender, filterCountry]);

  const handleSort = (field) => {
    setSortBy(field);
    setPage(1);
    setUsers([]);
  };

  const handleFilterGender = (e) => {
    setFilterGender(e.target.value);
    setPage(1);
    setUsers([]);
  };

  const handleFilterCountry = (e) => {
    setFilterCountry(e.target.value);
    setPage(1);
    setUsers([]);
  };

  return (
    <div>
      <div>
        <label>
          Sort by:
          <select onChange={(e) => handleSort(e.target.value)}>
            <option value="id">ID</option>
            <option value="name">Name</option>
            <option value="age">Age</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Filter by Gender:
          <select onChange={handleFilterGender}>
            <option value="">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Filter by Country:
          <input type="text" onChange={handleFilterCountry} placeholder="Country" />
        </label>
      </div>
      <InfiniteScroll
        dataLength={users.length}
        next={() => setPage(page + 1)}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        endMessage={<p>No more users to load</p>}
      >
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Country</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.age}</td>
                <td>{user.gender}</td>
                <td>{user.country}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </InfiniteScroll>
    </div>
  );
};

export default UserList;
