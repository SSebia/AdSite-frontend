import { useState, useEffect } from 'react';
import { FormControl, MenuItem, InputLabel, Select, Typography, Box, Button, TextField, Modal, List } from '@mui/material';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import { getCategories } from 'src/services/AdService';

export const AddAdModal = ({ addAdModalOpen, setAddAdModalOpen, showSnackbar, ads, setAds }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [city, setCity] = useState('');
    const [catID, setCatID] = useState('');
    const [categories, setCategories] = useState([]);
  
    const handleModalClose = () => {
      setAddAdModalOpen(false);
    };

    useEffect(() => {
      const fetchCategories = async () => {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      };
      fetchCategories();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bookData = {
            title,
            description,
            price: parseInt(price, 10),
            city,
            catID
        };

        if (!bookData.title || !bookData.description || !bookData.city || !bookData.price || !bookData.catID) {
            showSnackbar('Please fill out all fields!', { variant: 'error' });
            return;
        }
        if (bookData.title.length < 3 || bookData.description.length < 3 || bookData.city.length < 3) {
            showSnackbar('Title, description, and City must be at least 3 characters long!', { variant: 'error' });
            return;
        }
        if (bookData.description.length < 10) {
            showSnackbar('Description must be at least 10 characters long!', { variant: 'error' });
            return;
        }
        if (bookData.price < 1) {
            showSnackbar('Price must be at least 1!', { variant: 'error' });
            return;
        }
  
        try {
            const response = await apiClient.post(`ads/add`, bookData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status == 201) {
                showSnackbar('Advertisiment added!');
                setAds([...ads, response.data]);
                handleModalClose();
                setTitle('');
                setDescription('');
                setPrice('');
                setCity('');
                setCatID('');
            }
            else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to add ad!', { variant: 'error' });
            console.log(error)
        }
    };

    return (
        <Modal
          open={addAdModalOpen}
          onClose={handleModalClose}
          aria-labelledby="add-book-modal-title"
          aria-describedby="add-book-modal-description"
        >
          <Box sx={{ height: 600, overflow: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
            <List>
            <Typography id="add-book-modal-title" variant="h6" component="h2">
              Add a New Ad
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="description"
                label="Description"
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="price"
                label="Price"
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="city"
                label="City"
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <FormControl fullWidth margin="normal">
                <InputLabel id="category-select-label">Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={catID}
                  label="Category"
                  onChange={(e) => setCatID(e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Add Advertisiment
              </Button>
            </Box>
            </List>
          </Box>
        </Modal>
      );

}