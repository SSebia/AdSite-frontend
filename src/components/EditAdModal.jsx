import { useState, useEffect } from 'react';
import { FormControl, MenuItem, InputLabel, Select, Typography, Box, Button, TextField, Modal, List } from '@mui/material';
import apiClient from 'src/utils/apiClient';
import { getToken } from 'src/services/userService';
import { getCategories } from 'src/services/AdService';

export const EditAdModal = ({ selectedAdEdit, editAdModalOpen, setEditAdModalOpen, showSnackbar, ads, setAds }) => {
    const [adStates, setAdStates] = useState({});
    const [categories, setCategories] = useState([]);

    const currentAdState = adStates[selectedAdEdit.id] || {
        title: selectedAdEdit.title,
        description: selectedAdEdit.description,
        price: selectedAdEdit.price,
        city: selectedAdEdit.city,
        catID: selectedAdEdit.category.id,
    };

    useEffect(() => {
        const fetchCategories = async () => {
            const fetchedCategories = await getCategories();
            setCategories(fetchedCategories);
        };
        fetchCategories();
    }, []);

    const handleModalClose = () => {
        setEditAdModalOpen(false);
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAdStates((prev) => ({
                    ...prev,
                    [selectedAdEdit.id]: { ...currentAdState, base64: reader.result.toString() }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e, field) => {
        const { value } = e.target;
        setAdStates((prev) => ({
            ...prev,
            [selectedAdEdit.id]: { ...currentAdState, [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const adData = {
            ...currentAdState,
            pages: parseInt(currentAdState.pages, 10),
        };

        if (!adData.title || !adData.description || !adData.price || !adData.city || !adData.catID) {
            showSnackbar('Please fill out all fields!', { variant: 'error' });
            return;
        }
        if (adData.title.length < 3 || adData.description.length < 3 || adData.city.length < 3) {
            showSnackbar('Title, description, and City must be at least 3 characters long!', { variant: 'error' });
            return;
        }
        if (adData.description.length < 10) {
            showSnackbar('Description must be at least 10 characters long!', { variant: 'error' });
            return;
        }
        if (adData.price < 1) {
            showSnackbar('Price must be at least 1!', { variant: 'error' });
            return;
        }

        try {
            const response = await apiClient.post(`ads/edit/${selectedAdEdit.id}`, adData, {
                headers: {
                    'Authorization': `Bearer ${getToken()}`
                }
            });
            if (response.status === 200) {
                showSnackbar('AD edited!');
                const updatedAds = ads.map(ad =>
                    ad.id === selectedAdEdit.id ? { ...ad, ...adData, category: { id: adData.catID, name: categories.find(cat => cat.id === adData.catID).name } } : ad
                );
                setAds(updatedAds);
                handleModalClose();
            } else {
                showSnackbar('Server error', { variant: 'error' });
            }
        } catch (error) {
            showSnackbar('Failed to edit AD!', { variant: 'error' });
            console.log(error);
        }
    };

    return (
        <Modal
            open={editAdModalOpen}
            onClose={handleModalClose}
            aria-labelledby="edit-ad-modal-title"
            aria-describedby="edit-ad-modal-description"
        >
            <Box sx={{ height: 600, overflow: 'auto', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
                <List>
                    <Typography id="edit-ad-modal-title" variant="h6" component="h2">
                        Edit Ad
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
                            value={currentAdState.title}
                            onChange={(e) => handleChange(e, 'title')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="description"
                            label="Description"
                            type="text"
                            id="description"
                            value={currentAdState.description}
                            onChange={(e) => handleChange(e, 'description')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="price"
                            label="Price"
                            type="number"
                            id="price"
                            value={currentAdState.price}
                            onChange={(e) => handleChange(e, 'price')}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="city"
                            label="City"
                            type="text"
                            id="city"
                            value={currentAdState.city}
                            onChange={(e) => handleChange(e, 'city')}
                        />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="category-select-label">Category</InputLabel>
                            <Select
                                labelId="category-select-label"
                                id="category-select"
                                value={currentAdState.catID || ''}
                                label="Category"
                                onChange={(e) => handleChange(e, 'catID')}
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
                            Edit Advertisiment
                        </Button>
                    </Box>
                </List>
            </Box>
        </Modal>
    );
};
