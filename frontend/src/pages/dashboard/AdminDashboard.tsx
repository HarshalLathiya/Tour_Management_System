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
} from '@mui/material';
import { People, Map, Business, Warning } from '@mui/icons-material';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalTours: number;
  totalOrganizations: number;
  activeIncidents: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTours: 0,
    totalOrganizations: 0,
    activeIncidents: 0,
  });
  const [recentTours, setRecentTours] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, toursRes, orgsRes] = await Promise.all([
          api.get('/users'),
          api.get('/tours'),
          api.get('/organizations'),
        ]);
        
        setStats({
          totalUsers: usersRes.data.data?.length || 0,
          totalTours: toursRes.data.data?.length || 0,
          totalOrganizations: orgsRes.data.data?.length || 0,
          activeIncidents: 0,
        });
        
        setRecentTours(toursRes.data.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    
    fetchData();
  }, []);

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: <People fontSize="large" />, color: '#1976d2' },
    { title: 'Total Tours', value: stats.totalTours, icon: <Map fontSize="large" />, color: '#2e7d32' },
    { title: 'Organizations', value: stats.totalOrganizations, icon: <Business fontSize="large" />, color: '#ed6c02' },
    { title: 'Active Incidents', value: stats.activeIncidents, icon: <Warning fontSize="large" />, color: '#d32f2f' },
  ];

  return (
    <DashboardLayout>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Tours
            </Typography>
            <List>
              {recentTours.length > 0 ? (
                recentTours.map((tour: any) => (
                  <ListItem key={tour._id} divider>
                    <ListItemText
                      primary={tour.name}
                      secondary={`${tour.location} - ${new Date(tour.startDate).toLocaleDateString()}`}
                    />
                    <Chip
                      label={tour.status}
                      size="small"
                      color={tour.status === 'ongoing' ? 'success' : tour.status === 'planned' ? 'primary' : 'default'}
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No tours found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Status
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Server Status" secondary="Online" />
                <Chip label="Healthy" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Database" secondary="MongoDB" />
                <Chip label="Connected" color="success" size="small" />
              </ListItem>
              <ListItem>
                <ListItemText primary="API Version" secondary="v1.0.0" />
                <Chip label="Current" color="primary" size="small" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminDashboard;
