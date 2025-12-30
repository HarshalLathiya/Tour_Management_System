import React, { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  CardActions,
} from '@mui/material';
import { Map, Event, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const ParticipantDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [upcomingTours, setUpcomingTours] = useState<any[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toursRes = await api.get('/tours');
        const tours = toursRes.data.data || [];
        
        const upcoming = tours.filter((t: any) => 
          new Date(t.startDate) > new Date() && 
          (t.status === 'planned' || t.status === 'draft')
        );
        setUpcomingTours(upcoming.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName || 'Participant'}!
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    My Registrations
                  </Typography>
                  <Typography variant="h4">
                    {myRegistrations.length}
                  </Typography>
                </Box>
                <Box sx={{ color: '#1976d2' }}>
                  <CheckCircle fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Upcoming Tours
                  </Typography>
                  <Typography variant="h4">
                    {upcomingTours.length}
                  </Typography>
                </Box>
                <Box sx={{ color: '#2e7d32' }}>
                  <Event fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Available Tours
                  </Typography>
                  <Typography variant="h4">
                    {upcomingTours.length}
                  </Typography>
                </Box>
                <Box sx={{ color: '#ed6c02' }}>
                  <Map fontSize="large" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Available Tours
              </Typography>
              <Button size="small" onClick={() => navigate('/tours')}>
                View All Tours
              </Button>
            </Box>
            
            {upcomingTours.length > 0 ? (
              <Grid container spacing={2}>
                {upcomingTours.map((tour: any) => (
                  <Grid item xs={12} sm={6} md={4} key={tour._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="h6" noWrap>
                          {tour.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          {tour.location}
                        </Typography>
                        <Typography variant="body2">
                          {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                        </Typography>
                        <Box mt={1}>
                          <Chip 
                            label={`${tour.currentParticipants}/${tour.maxParticipants} spots`}
                            size="small"
                            color={tour.currentParticipants < tour.maxParticipants ? 'success' : 'error'}
                          />
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Button size="small" color="primary">
                          View Details
                        </Button>
                        <Button 
                          size="small" 
                          variant="contained"
                          disabled={tour.currentParticipants >= tour.maxParticipants}
                        >
                          Register
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography color="textSecondary" align="center" py={4}>
                No upcoming tours available at the moment.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ParticipantDashboard;
