import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add, Search, Visibility, Edit, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TourList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tours, setTours] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      const response = await api.get('/tours');
      setTours(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tour?')) {
      try {
        await api.delete(`/tours/${id}`);
        fetchTours();
      } catch (error) {
        console.error('Error deleting tour:', error);
      }
    }
  };

  const filteredTours = tours.filter((tour) =>
    tour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tour.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'success';
      case 'planned': return 'primary';
      case 'completed': return 'default';
      case 'cancelled': return 'error';
      default: return 'warning';
    }
  };

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Tours</Typography>
        {(user?.role === 'admin' || user?.role === 'organizer') && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/tours/create')}
          >
            Create Tour
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search tours..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTours.length > 0 ? (
              filteredTours.map((tour) => (
                <TableRow key={tour._id}>
                  <TableCell>{tour.name}</TableCell>
                  <TableCell>{tour.location}</TableCell>
                  <TableCell>{new Date(tour.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(tour.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{tour.currentParticipants}/{tour.maxParticipants}</TableCell>
                  <TableCell>
                    <Chip
                      label={tour.status}
                      size="small"
                      color={getStatusColor(tour.status) as any}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                    {(user?.role === 'admin' || user?.role === 'organizer') && (
                      <>
                        <IconButton size="small" color="info">
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleDelete(tour._id)}
                        >
                          <Delete />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {loading ? 'Loading...' : 'No tours found'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </DashboardLayout>
  );
};

export default TourList;
