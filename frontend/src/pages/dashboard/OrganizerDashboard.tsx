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
} from '@mui/material';
import { Map, People, AttachMoney, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const OrganizerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    myTours: 0,
    totalParticipants: 0,
    totalBudget: 0,
  });
  const [myTours, setMyTours] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const toursRes = await api.get('/tours');
        const tours = toursRes.data.data || [];
        
        setStats({
          myTours: tours.length,
          totalParticipants: tours.reduce((acc: number, t: any) => acc + (t.currentParticipants || 0), 0),
          totalBudget: 0,
        });
        
        setMyTours(tours.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  const statCards = [
    { title: 'My Tours', value: stats.myTours, icon: <Map fontSize="large" />, color: '#1976d2' },
    { title: 'Total Participants', value: stats.totalParticipants, icon: <People fontSize="large" />, color: '#2e7d32' },
    { title: 'Total Budget', value: `$${stats.totalBudget}`, icon: <AttachMoney fontSize="large" />, color: '#ed6c02' },
  ];

  return (
    <DashboardLayout>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Organizer Dashboard
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/tours/create')}
        >
          Create Tour
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4">
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                My Tours
              </Typography>
              <Button size="small" onClick={() => navigate('/tours')}>
                View All
              </Button>
            </Box>
            <List>
              {myTours.length > 0 ? (
                myTours.map((tour: any) => (
                  <ListItem key={tour._id} divider>
                    <ListItemText
                      primary={tour.name}
                      secondary={
                        <>
                          {tour.location} | {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                          <br />
                          Participants: {tour.currentParticipants}/{tour.maxParticipants}
                        </>
                      }
                    />
                    <Chip
                      label={tour.status}
                      size="small"
                      color={
                        tour.status === 'ongoing' ? 'success' :
                        tour.status === 'planned' ? 'primary' :
                        tour.status === 'completed' ? 'default' : 'warning'
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText 
                    primary="No tours yet" 
                    secondary="Click 'Create Tour' to get started"
                  />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default OrganizerDashboard;
