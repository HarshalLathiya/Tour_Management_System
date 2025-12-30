import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';

const tourSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().min(2, 'Location is required'),
  maxParticipants: z.number().min(1, 'Must have at least 1 participant'),
  organization: z.string().min(1, 'Organization is required'),
  status: z.string().default('draft'),
});

type TourFormData = z.infer<typeof tourSchema>;

const CreateTour: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [organizations, setOrganizations] = useState<any[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TourFormData>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      maxParticipants: 20,
      organization: '',
      status: 'draft',
    },
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await api.get('/organizations');
        setOrganizations(response.data.data || []);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      }
    };
    fetchOrganizations();
  }, []);

  const onSubmit = async (data: TourFormData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/tours', data);
      navigate('/tours');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box mb={3}>
        <Typography variant="h4">Create New Tour</Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Tour Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.startDate}
                    helperText={errors.startDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="endDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Date"
                    type="date"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.endDate}
                    helperText={errors.endDate?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="maxParticipants"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Max Participants"
                    type="number"
                    fullWidth
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    error={!!errors.maxParticipants}
                    helperText={errors.maxParticipants?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="organization"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Organization"
                    select
                    fullWidth
                    error={!!errors.organization}
                    helperText={errors.organization?.message}
                  >
                    {organizations.map((org) => (
                      <MenuItem key={org._id} value={org._id}>
                        {org.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Status"
                    select
                    fullWidth
                  >
                    <MenuItem value="draft">Draft</MenuItem>
                    <MenuItem value="planned">Planned</MenuItem>
                    <MenuItem value="ongoing">Ongoing</MenuItem>
                  </TextField>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" gap={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/tours')}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Tour'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </DashboardLayout>
  );
};

export default CreateTour;
