import { Box, Card, CardContent, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Error from '@mui/icons-material/Error';
import type { BotActionLogResponse } from '../../../../api/types/session.ts';

interface SessionLogViewerProps {
    logs: BotActionLogResponse[];
}

const SessionLogViewer = ({ logs }: SessionLogViewerProps) => {
    const isEmpty = logs.length === 0;

    return (
        <Box sx={{ my: 3 }}>
            <Card>
                <CardContent>
                    <Typography variant='h5' gutterBottom>
                        Bot Actions
                    </Typography>
                    <Divider sx={{ mb: 2 }}/>
                    {isEmpty ? (
                        <Typography color='text.secondary' sx={{ py: 2, textAlign: 'center' }}>
                            No bot actions recorded yet.
                        </Typography>
                    ) : (
                        <List>
                            {logs.map((log, index) => (
                                <ListItem
                                    key={log.id}
                                    secondaryAction={
                                        log.successful
                                            ? <CheckCircle color='success'/>
                                            : <Error color='error'/>
                                    }
                                >
                                    <ListItemText
                                        primary={`${index + 1}. ${log.actionType}`}
                                        secondary={`${new Date(log.occurredAt).toLocaleTimeString()} — ${log.details ?? 'no details'}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                    <Divider sx={{ my: 2 }}/>
                    <Typography variant='h6'>Total: {logs.length} action(s)</Typography>
                </CardContent>
            </Card>
        </Box>
    );
};

export default SessionLogViewer;