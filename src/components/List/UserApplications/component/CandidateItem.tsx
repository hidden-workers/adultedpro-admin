import { User, UserApplication } from '../../../../interfaces';
import { setUserApplication } from '../../../../store/reducers/userApplicationsSlice';
import { maskEmail } from '../../../../utils/functions';
import { useStateContext } from '../../../../context/useStateContext';
import { Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store/store';
export const CandidateItem = ({
  item,
  type,
  visitedCandidates,
  setVisitedCandidates,
}: {
  item: User | UserApplication;
  type: 'Students' | 'UserApplications';
  visitedCandidates: any;
  setVisitedCandidates: any;
}) => {
  const { setSelectedUserApplication, setSelectedStudent, mainBranch } =
    useStateContext();
  const { employer } = useSelector((state: RootState) => state.employer);
  const dispatch = useDispatch();
  const isVisited =
    type == 'Students'
      ? visitedCandidates.students.find(
          (student) => student.email === (item as User).email,
        )
      : visitedCandidates.applicants.find(
          (applicant) =>
            applicant?.applicant?.email ==
              (item as UserApplication)?.applicant?.email ||
            applicant?.applicantEmail ==
              (item as UserApplication)?.applicantEmail,
        );

  const isReviewed =
    mainBranch?.reviewedStudents?.includes(item?.id) ||
    mainBranch?.reviewedUserApplications?.includes(item?.id);
  const isBookmarked =
    mainBranch?.bookmarkedStudents?.includes(item?.id) ||
    mainBranch?.bookmarkedUserApplications?.includes(item?.id);

  const onCandidateClick = (
    item: User | UserApplication,
    type: 'Students' | 'UserApplications',
  ) => {
    if (type === 'Students') {
      const updatedItem = { ...(item as User) };
      updatedItem.visitedBy = [
        ...(updatedItem.visitedBy || []),
        employer?.email,
      ];
      setVisitedCandidates((pre) => ({
        ...pre,
        students: [...pre.students, updatedItem],
      }));
      setSelectedStudent(updatedItem);
      // dispatch<any>(
      //   updateMongoCandidate({
      //     userId: updatedItem.id,
      //     userData: updatedItem as User,
      //   }),
      // );
    } else {
      const updatedItem = { ...(item as UserApplication) };
      updatedItem.applicant = { ...updatedItem.applicant };
      updatedItem.applicant.visitedBy = [
        ...(updatedItem?.applicant?.visitedBy || []),
        employer?.email,
      ];
      setVisitedCandidates((pre) => ({
        ...pre,
        applicants: [...pre.applicants, updatedItem],
      }));
      setSelectedUserApplication(updatedItem);
      dispatch<any>(setUserApplication(updatedItem));
    }
  };
  return (
    <div
      onClick={() => onCandidateClick(item, type)}
      className={`flex items-center justify-between rounded-lg p-4  
        ${isVisited ? 'bg-inherit' : 'border border-primary/10 bg-primary/5'}
         hover:g-[#F9FAFB]/90 cursor-pointer hover:bg-primary/10 dark:hover:bg-meta-4`}
    >
      <div className="grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 grid-cols-6 items-center gap-3 w-full overflow-x-auto ">
        <div className="col-span-1 relative h-full w-full flex justify-center overflow-hidden">
          {(item as User)?.photoUrl ||
          (item as UserApplication)?.applicant?.photoUrl ? (
            <img
              src={
                (item as User)?.photoUrl ||
                (item as UserApplication)?.applicant?.photoUrl
              }
              alt="user"
              className="h-12 w-12 rounded-full object-cover object-center"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black capitalize text-white ">
              {(item as User)?.name?.charAt(0) ||
                (item as UserApplication)?.applicant?.name?.charAt(0)}
            </span>
          )}
        </div>
        <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 col-span-5 ">
          <div className="flex justify-between items-center">
            <h4 className="w-max text-base font-medium text-black dark:text-white">
              {(item as User)?.name ||
                (item as UserApplication)?.applicant?.name ||
                maskEmail(
                  (item as User)?.email ||
                    (item as UserApplication)?.applicant?.email,
                )}
            </h4>
            <div className="flex justify-end gap-1">
              <Tooltip placement="top" title="Reviewed">
                <span
                  className={`w-5 h-5 ml-1 px-1 py-1 rounded border text-sm flex justify-center items-center text-white ${isReviewed ? 'bg-meta-8' : 'hidden'}`}
                >
                  {isReviewed ? 'R' : ''}
                </span>
              </Tooltip>
              <Tooltip placement="top" title="Bookmarked">
                <span
                  className={`w-5 h-5 ml-1 px-1 py-1 rounded border text-sm flex justify-center items-center text-white ${isBookmarked ? 'bg-meta-6' : 'hidden'}`}
                >
                  {isBookmarked ? 'B' : ''}
                </span>
              </Tooltip>
            </div>
          </div>
          <p className="truncate text-sm">
            {(
              (item as User)?.tagLine ||
              (item as UserApplication)?.applicant?.tagLine
            )?.substring(0, 40) || 'No tagline'}
          </p>
        </div>
      </div>
    </div>
  );
};
