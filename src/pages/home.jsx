import React, { useState, useEffect } from 'react';
import { Rating, AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, TextField, Select, MenuItem as DropdownItem, Card, CardContent, Grid, FormControl, InputLabel } from '@mui/material';
import { useAuth } from "src/services/AuthContext";
import { getAds, getCategories } from 'src/services/AdService';
import CardHeader from '@mui/material/CardHeader';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useSnackbar } from 'notistack';
import { AdDetailsModal } from 'src/components/AdDetailsModal';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import { AddAdModal } from 'src/components/AddAdModal';
import { EditCategoriesModal } from 'src/components/EditCategoriesModal';
import DeleteIcon from '@mui/icons-material/Delete';
import { EditAdModal } from 'src/components/EditAdModal';

const Home = () => {
  const { user, logoutUser } = useAuth();
  if (!user) return null;
  const { enqueueSnackbar } = useSnackbar();
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAd, setSelectedAd] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addAdModalOpen, setAddAdModalOpen] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editAdModalOpen, setEditAdModalOpen] = useState(false);
  const [selectedAdEdit, setSelectedAdEdit] = useState(null);
  const open = Boolean(anchorEl);
  const isAdmin = (user != null ? user.rol.includes("Admin") : false);

  const showSnackbar = (message, options = {}) => {
      enqueueSnackbar(message, {
          variant: 'success',
          anchorOrigin: { horizontal: 'center', vertical: 'top' },
          ...options,
      });
  };

  useEffect(() => {
    const fetchAds = async () => {
      const ads = await getAds();
      setAds(ads);
    };
    const fetchCategories = async () => {
      const categories = await getCategories();
      setCategories(categories);
    };
    fetchAds();
    fetchCategories();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logoutUser();
  };

  const viewAd = (ad) => {
    setSelectedAd(ad);
    setModalOpen(true);
  };

  const editAd = (ad) => {
    setSelectedAdEdit(ad);
    setEditAdModalOpen(true);
  };

  const deleteAd = async (ad) => {
    try {
      const response = await apiClient.delete(`ads/delete/${ad.id}`, {
          headers: {
              'Authorization': `Bearer ${getToken()}`
          }
      });
      if (response.status == 204) {
          showSnackbar('Advertisiment deleted!');
          const updatedAds = ads.filter(b => b.id !== ad.id);
          setAds(updatedAds);
      }
      else {
          showSnackbar('Server error', { variant: 'error' });
      }
    } catch (error) {
        showSnackbar('Failed to delete advertisiment!', { variant: 'error' });
        console.log(error)
    }
  };

  const addAd = () => {
    setAddAdModalOpen(true);
  };

  const editCategory = () => {
    setEditCategoryModalOpen(true);
  };

  const filteredAds = ads.filter(ad => {
    return ad.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
           (selectedCategory ? ad.category.name === selectedCategory : true);
  });

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Ad Site
          </Typography>
          <Avatar
            alt="User Name"
            src="https://cdn-icons-png.freepik.com/512/147/147144.png"
            onClick={handleMenu}
            sx={{ cursor: 'pointer' }}
          />
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            keepMounted
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: '20px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <TextField
            label="Search by Title"
            variant="outlined"
            sx={{ width: '70%' }}
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <FormControl sx={{ width: '25%' }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={handleCategoryChange}
            >
              <DropdownItem value="">All</DropdownItem>
              {categories.map(category => (
                <DropdownItem key={category.id} value={category.name}>{category.name}</DropdownItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {isAdmin && (
          <Box sx={{ marginBottom: '20px', display: 'flex', flexDirection: 'row' }}>
            <IconButton color="inherit" aria-label="add new ad" onClick={addAd}>
              <AddCircleOutlineIcon />
            </IconButton>
            <Typography sx={{ paddingLeft: '5px'}}>
              (Add a new Ad)
            </Typography>
            <IconButton color="inherit" aria-label="edit categories" onClick={editCategory} sx={{marginLeft: '30px'}}>
              <EditIcon />
            </IconButton>
            <Typography sx={{ paddingLeft: '5px'}}>
              (Edit categories)
            </Typography>
          </Box>
        )}
        
        <Grid container spacing={2}>
          {filteredAds.map(ad => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={ad.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardHeader
                  action={
                    <>
                      <IconButton aria-label="view-ad" onClick={() => viewAd(ad)}>
                        <VisibilityIcon />
                      </IconButton>
                      {isAdmin && (
                        <>
                          <IconButton aria-label="edit-ad" onClick={() => editAd(ad)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton aria-label="delete-ad" onClick={() => deleteAd(ad)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </>
                  }
                  title={ad.title}
                  subheader={ad.category.name}
                />
                <Box sx={{ paddingLeft: '15px', paddingBottom: '5px', display: 'flex', flexDirection: 'row' }}>
                  <Typography sx={{ paddingLeft: '5px', fontSize: '21px'}}>
                    {ad.price}$
                  </Typography>
                </Box>
                <CardContent sx={{ display: 'flex', flexDirection: 'row' }}>
                  <Box>
                    <Typography variant="body2">
                      {ad.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        {selectedAd && <AdDetailsModal selectedAd={selectedAd} modalOpen={modalOpen} setModalOpen={setModalOpen} user={user} showSnackbar={showSnackbar} />}
        {addAdModalOpen && <AddAdModal addAdModalOpen={addAdModalOpen} setAddAdModalOpen={setAddAdModalOpen} showSnackbar={showSnackbar} ads={ads} setAds={setAds} />}
        {editCategoryModalOpen && <EditCategoriesModal editCategoryModalOpen={editCategoryModalOpen} setEditCategoryModalOpen={setEditCategoryModalOpen} showSnackbar={showSnackbar} categories={categories} setCategories={setCategories} ads={ads} setAds={setAds} />}
        {selectedAdEdit && <EditAdModal selectedAdEdit={selectedAdEdit} editAdModalOpen={editAdModalOpen} setEditAdModalOpen={setEditAdModalOpen} showSnackbar={showSnackbar} categories={categories} setCategories={setCategories} ads={ads} setAds={setAds} />}
      </Box>
    </Box>
  );
};

export default Home;