import {
  StyledInput,
  StyledPageView,
  StyledSkeleton,
  StyledText,
  StyledView,
} from '@common/components';
import VectorIcon from '@common/components/VectorIcon';
import PageHeader from '@kaksha/components/PageHeader';
import URLS from '@kaksha/constants/urls';
import {RootStackParamList} from '@kaksha/navigator';
import request, {ResponseType} from '@kaksha/services/api/request';
import {Todo} from '@kaksha/types/todo';
import useRequest from '@kaksha/utils/useRequest';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTheme} from '@rneui/themed';
import {FlashList, ListRenderItem} from '@shopify/flash-list';
import {useCallback, useEffect, useState} from 'react';
import {RefreshControl} from 'react-native';

type TodoProps = NativeStackScreenProps<RootStackParamList, 'todo'>;
const PILL_SIZE = 50;

const TodoCard = ({
  performTodoAction,
  ...item
}: Todo & {
  performTodoAction: (
    action: 'delete' | 'complete',
    id: number,
  ) => Promise<void>;
}) => {
  const {theme} = useTheme();

  const getTodoColor = () => {
    switch (item.status) {
      case 'COMPLETED':
        return theme.colors.success;
      case 'PENDING':
        return theme.colors.warning;
    }
  };

  return (
    <StyledView
      tw={'pl-4 mb-2 flex-row items-center overflow-hidden'}
      style={{
        backgroundColor: theme.colors.bottomSheetBg,
        borderRadius: 20,
        gap: 10,
      }}>
      <StyledView tw={'flex-1 my-3'}>
        <StyledText h3 lightText>
          Task
        </StyledText>
        <StyledText h2>{item.title}</StyledText>

        <StyledText h3 lightText>
          Status
        </StyledText>
        <StyledText
          h2
          h2Style={{
            color: getTodoColor(),
          }}>
          {item.status}
        </StyledText>
      </StyledView>
      <StyledView style={{width: PILL_SIZE}}>
        {item.status === 'PENDING' && (
          <StyledView
            touchable
            onPress={() => performTodoAction('complete', item.id)}
            tw="flex-1 items-center justify-center"
            style={{backgroundColor: theme.colors.primary}}>
            <StyledText tw="text-white mb-[-5]" h2>
              <VectorIcon name="check" type="Feather" className="text-white" />
            </StyledText>
          </StyledView>
        )}
        <StyledView
          touchable
          onPress={() => performTodoAction('delete', item.id)}
          tw="flex-1 items-center justify-center"
          style={{backgroundColor: theme.colors.error}}>
          <StyledText tw="text-white" h2>
            <VectorIcon name="x" type="Feather" className="text-white" />
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledView>
  );
};

const TodoPage = ({navigation}: TodoProps) => {
  const [todoText, setTodoText] = useState('');
  const [addTodoLoading, setAddTodoLoading] = useState(false);
  const {theme} = useTheme();
  const {loading, getResponse, data} = useRequest<ResponseType<Todo[]> | null>({
    requestParams: {
      method: 'GET',
      url: URLS.auth.todo,
    },
    initialState: null,
  });

  const addTodo = async (todo: string) => {
    setAddTodoLoading(true);
    const {status, HttpStatusCode, data} = await request({
      method: 'POST',
      url: URLS.auth.todo,
      data: {
        description: todo,
      },
    });
    if (status === HttpStatusCode.OK && data) {
      getResponse();
    }
    setAddTodoLoading(false);
  };

  const performTodoAction = async (
    action: 'delete' | 'complete',
    id: number,
  ) => {
    if (action === 'delete') {
      var {status, HttpStatusCode, data} = await request({
        method: 'DELETE',
        url: URLS.auth.todo,
        data: {
          id,
        },
      });
    } else {
      var {status, HttpStatusCode, data} = await request({
        method: 'PUT',
        url: URLS.auth.todo,
        data: {
          id,
          status: 'COMPLETED',
        },
      });
    }
    if (status === HttpStatusCode.OK && data) {
      getResponse();
    }
  };

  const renderItem = useCallback<ListRenderItem<Todo>>(({item}) => {
    return <TodoCard {...item} performTodoAction={performTodoAction} />;
  }, []);

  useEffect(() => {
    getResponse();
  }, []);

  return (
    <StyledPageView>
      <PageHeader navigation={navigation} title="Todo" />
      <StyledView tw={'flex-1 overflow-hidden'}>
        <FlashList
          refreshControl={
            <RefreshControl onRefresh={getResponse} refreshing={false} />
          }
          showsVerticalScrollIndicator={false}
          data={data?.data}
          keyExtractor={item => `${item.id}`}
          renderItem={renderItem}
          estimatedItemSize={150}
          ListEmptyComponent={() =>
            loading ? (
              [...Array(3)].map((_, i) => (
                <StyledSkeleton
                  key={i}
                  tw="mb-2"
                  height={150}
                  style={{borderRadius: 20}}
                />
              ))
            ) : (
              <StyledView
                tw={'items-center justify-center'}
                style={{height: 120}}>
                <StyledText h2 lightText>
                  No Todo..
                </StyledText>
              </StyledView>
            )
          }
        />
      </StyledView>
      <StyledView tw={'flex-row mt-2'}>
        <StyledInput
          placeholder="Add Todo..."
          value={todoText}
          onChangeText={text => setTodoText(text)}
          disabled={addTodoLoading}
          rightIcon={
            <StyledView
              tw={'p-1'}
              touchable={todoText !== '' || addTodoLoading}
              onPress={async () => {
                await addTodo(todoText);
                setTodoText('');
              }}
              style={{borderRadius: 20}}>
              <VectorIcon
                size={20}
                color={
                  todoText !== '' ? theme.colors.black : theme.colors.grey5
                }
                name={'send'}
                type="Feather"
              />
            </StyledView>
          }
          inputContainerStyle={{
            paddingStart: 10,
          }}
          containerStyle={{
            paddingVertical: 0,
            justifyContent: 'center',
          }}
        />
      </StyledView>
    </StyledPageView>
  );
};

export default TodoPage;
