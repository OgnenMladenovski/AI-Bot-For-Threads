import { Box, Button, CircularProgress, Grid } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
import useSessions from '../../../../hooks/useSessions.ts';
import SessionCard from '../../../components/session/SessionCard/SessionCard.tsx';
import StartSessionDialog from '../../../components/session/StartSessionDialog/StartSessionDialog.tsx';
import SectionHeading from '../../../components/common/SectionHeading/SectionHeading.tsx';
import EmptyState from '../../../components/common/EmptyState/EmptyState.tsx';

const SessionsPage = () => {
  const { sessions, loading } = useSessions();

  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState<boolean>(false);

  return (
    <Box>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress/>
        </Box>
      )}
      {!loading &&
       <>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
               <SectionHeading title='Extraction Sessions' subtitle='Every run of the bot against a Threads profile, hashtag or feed.'/>
               <Button variant='contained' startIcon={<AddIcon/>} onClick={() => setNewSessionDialogOpen(true)}>
                   New Session
               </Button>
           </Box>
           {sessions.length === 0 && (
               <EmptyState
                   title='No extraction sessions yet'
                   description='Create one to set your bot in motion against a Threads profile.'
               />
           )}
           <Grid container spacing={2} sx={{ mt: 1 }}>
               {sessions.map((session) => (
                   <Grid key={session.id} size={{ xs: 12, sm: 6, md: 4 }}>
                       <SessionCard session={session}/>
                   </Grid>
               ))}
           </Grid>
         <StartSessionDialog
           open={newSessionDialogOpen}
           onClose={() => setNewSessionDialogOpen(false)}
         />
       </>}
    </Box>
  );
};

export default SessionsPage;
